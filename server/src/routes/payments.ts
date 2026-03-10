import { Router, Request, Response, NextFunction } from 'express';
import pool from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { v4 as uuidv4 } from 'uuid';

export const paymentsRouter = Router();

const VTB_GATEWAY = process.env.VTB_GATEWAY_URL || 'https://platezh.vtb24.ru/payment/rest';
const VTB_USERNAME = process.env.VTB_USERNAME || process.env.VTB_CLIENT_ID;
const VTB_PASSWORD = process.env.VTB_PASSWORD || process.env.VTB_CLIENT_SECRET;
const SITE_URL = process.env.CORS_ORIGIN?.split(',')[0] || 'https://kladovka78.ru';

type VtbCardAuthInfo = {
  pan?: string;
  cardholderName?: string;
};

type VtbPaymentAmountInfo = {
  paymentState?: string;
};

type VtbResponse = {
  errorCode?: string;
  errorMessage?: string;
  orderId?: string;
  formUrl?: string;
  orderStatus?: number | string;
  cardAuthInfo?: VtbCardAuthInfo;
  paymentAmountInfo?: VtbPaymentAmountInfo;
  [key: string]: unknown;
};

// Helper: call VTB gateway
async function vtbRequest(method: string, params: Record<string, string>): Promise<VtbResponse> {
  const body = new URLSearchParams({
    userName: VTB_CLIENT_ID || '',
    password: VTB_CLIENT_SECRET || '',
    ...params,
  });

  const url = `${VTB_GATEWAY}/${method}`;
  console.log(`[VTB] Request: ${method}, URL: ${url}`);

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });

  const contentType = response.headers.get('content-type') || '';
  const text = await response.text();

  if (!contentType.includes('application/json')) {
    console.error(`[VTB] Non-JSON response (${response.status}): ${text.substring(0, 300)}`);
    throw new Error(`Платёжный шлюз вернул некорректный ответ (HTTP ${response.status}). Проверьте VTB_GATEWAY_URL, VTB_CLIENT_ID и VTB_CLIENT_SECRET.`);
  }

  try {
    return JSON.parse(text) as VtbResponse;
  } catch {
    console.error(`[VTB] JSON parse failed: ${text.substring(0, 300)}`);
    throw new Error('Не удалось разобрать ответ платёжного шлюза');
  }
}

// POST /api/payments/create — register order in VTB and return payment URL
paymentsRouter.post('/create', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { rentalId, customerId, cellId, amount, duration, cellNumber, description } = req.body;

    if (!customerId || !amount) {
      throw new AppError('Обязательные поля: customerId, amount', 400);
    }

    if (!VTB_CLIENT_ID || !VTB_CLIENT_SECRET) {
      throw new AppError('Платёжная система не настроена', 500);
    }

    const id = uuidv4();
    const amountKopecks = Math.round(amount * 100); // convert rubles to kopecks
    const orderDescription = description || `Аренда ячейки №${cellNumber || ''} на ${duration || ''} мес.`;

    const returnUrl = `${SITE_URL}/payment/success?paymentId=${id}`;
    const failUrl = `${SITE_URL}/payment/fail?paymentId=${id}`;

    // Register order in VTB
    const vtbResponse = (await vtbRequest('register.do', {
      orderNumber: id,
      amount: String(amountKopecks),
      currency: '643',
      returnUrl,
      failUrl,
      description: orderDescription,
      language: 'ru',
    })) as { errorCode?: string; errorMessage?: string; orderId?: string; formUrl?: string };

    if (vtbResponse.errorCode && vtbResponse.errorCode !== '0') {
      console.error('VTB register.do error:', vtbResponse);
      throw new AppError(`Ошибка платёжного шлюза: ${vtbResponse.errorMessage || 'Неизвестная ошибка'}`, 502);
    }

    const vtbOrderId = vtbResponse.orderId;
    const formUrl = vtbResponse.formUrl;

    // Save payment to DB
    await pool.query(
      `INSERT INTO payments (id, rental_id, customer_id, cell_id, amount, description, vtb_order_id, vtb_form_url, status, return_url, fail_url, client_ip, vtb_response)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?, ?)`,
      [
        id, rentalId || null, customerId, cellId || null,
        amountKopecks, orderDescription,
        vtbOrderId, formUrl,
        returnUrl, failUrl,
        req.ip || null,
        JSON.stringify(vtbResponse),
      ]
    );

    res.json({
      success: true,
      data: {
        paymentId: id,
        formUrl, // redirect user here
        vtbOrderId,
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/payments/:id/status — check payment status via VTB
paymentsRouter.get('/:id/status', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const [rows] = await pool.query('SELECT * FROM payments WHERE id = ?', [req.params.id]);
    const payment = (rows as any[])[0];
    if (!payment) throw new AppError('Платёж не найден', 404);

    // If already final status, return from DB
    if (['paid', 'refunded'].includes(payment.status)) {
      return res.json({
        success: true,
        data: {
          paymentId: payment.id,
          status: payment.status,
          amount: payment.amount / 100,
          paidAt: payment.paid_at,
        },
      });
    }

    if (!payment.vtb_order_id) {
      return res.json({ success: true, data: { paymentId: payment.id, status: payment.status } });
    }

    // Check VTB
    const vtbResponse = (await vtbRequest('getOrderStatusExtended.do', {
      orderId: payment.vtb_order_id,
    })) as {
      orderStatus?: number | string;
      cardAuthInfo?: { pan?: string; cardholderName?: string };
      paymentAmountInfo?: { paymentState?: string };
    };

    // VTB orderStatus: 0=registered, 1=preauth, 2=paid, 3=reversed, 4=refunded, 5=auth via ACS, 6=declined
    const vtbStatus = vtbResponse.orderStatus;
    let newStatus = payment.status;
    let paidAt = null;

    if (vtbStatus === 2) {
      newStatus = 'paid';
      paidAt = new Date();
    } else if (vtbStatus === 3 || vtbStatus === 4) {
      newStatus = 'refunded';
    } else if (vtbStatus === 6) {
      newStatus = 'failed';
    }

    const paymentMethod = vtbResponse.cardAuthInfo?.pan
      ? vtbResponse.paymentAmountInfo?.paymentState || vtbResponse.cardAuthInfo?.cardholderName || null
      : null;

    // Update DB if status changed
    if (newStatus !== payment.status) {
      await pool.query(
        `UPDATE payments SET status = ?, payment_method = ?, paid_at = ?, vtb_response = ?, updated_at = NOW() WHERE id = ?`,
        [newStatus, paymentMethod, paidAt, JSON.stringify(vtbResponse), payment.id]
      );

      // If paid — activate rental if exists
      if (newStatus === 'paid' && payment.rental_id) {
        await pool.query(
          "UPDATE rentals SET status = 'active' WHERE id = ? AND status != 'active'",
          [payment.rental_id]
        );
        // Mark cell as occupied
        if (payment.cell_id) {
          await pool.query(
            "UPDATE cells SET status = 'occupied', reserved_until = NULL WHERE id = ?",
            [payment.cell_id]
          );
        }
      }
    }

    res.json({
      success: true,
      data: {
        paymentId: payment.id,
        status: newStatus,
        amount: payment.amount / 100,
        paidAt,
        vtbOrderStatus: vtbStatus,
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/payments — list payments (admin)
paymentsRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status, customer_id } = req.query;
    let query = `
      SELECT p.id, p.rental_id AS rentalId, p.customer_id AS customerId, p.cell_id AS cellId,
        p.amount, p.currency, p.description, p.vtb_order_id AS vtbOrderId,
        p.status, p.payment_method AS paymentMethod,
        p.paid_at AS paidAt, p.created_at AS createdAt,
        c.name AS customerName, c.phone AS customerPhone
      FROM payments p
      LEFT JOIN customers c ON p.customer_id = c.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (status) { query += ' AND p.status = ?'; params.push(status); }
    if (customer_id) { query += ' AND p.customer_id = ?'; params.push(customer_id); }

    query += ' ORDER BY p.created_at DESC';

    const [rows] = await pool.query(query, params);

    const payments = (rows as any[]).map(p => ({
      ...p,
      amount: p.amount / 100, // kopecks to rubles
    }));

    res.json({ success: true, data: payments });
  } catch (error) {
    next(error);
  }
});

// POST /api/payments/:id/refund — refund payment
paymentsRouter.post('/:id/refund', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const [rows] = await pool.query('SELECT * FROM payments WHERE id = ?', [req.params.id]);
    const payment = (rows as any[])[0];
    if (!payment) throw new AppError('Платёж не найден', 404);
    if (payment.status !== 'paid') throw new AppError('Можно вернуть только оплаченный платёж', 400);

    const { amount } = req.body;
    const refundAmount = amount ? Math.round(amount * 100) : payment.amount;

    const vtbResponse = (await vtbRequest('refund.do', {
      orderId: payment.vtb_order_id,
      amount: String(refundAmount),
    })) as { errorCode?: string; errorMessage?: string };

    if (vtbResponse.errorCode && vtbResponse.errorCode !== '0') {
      throw new AppError(`Ошибка возврата: ${vtbResponse.errorMessage}`, 502);
    }

    await pool.query(
      "UPDATE payments SET status = 'refunded', vtb_response = ?, updated_at = NOW() WHERE id = ?",
      [JSON.stringify(vtbResponse), payment.id]
    );

    res.json({ success: true, message: 'Возврат выполнен' });
  } catch (error) {
    next(error);
  }
});
