import { Router, Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import pool from '../config/database';
import { AppError } from '../middleware/errorHandler';
import {
  createMerchantOrder,
  createMerchantRefund,
  getMerchantOrder,
  getOrderPaymentObject,
  getVtbStatusChangedAt,
  getVtbStatusValue,
  type VtbCallbackPayload,
  type VtbOrderResponse,
} from '../vtbMerchantApi';

export const paymentsRouter = Router();

const SITE_URL = process.env.CORS_ORIGIN?.split(',')[0]?.trim() || 'https://kladovka78.ru';
const ORDER_EXPIRE_MINUTES = Number(process.env.VTB_ORDER_EXPIRE_MINUTES || 120);

type PaymentDbRow = {
  id: string;
  rental_id: string | null;
  customer_id: string;
  cell_id: string | null;
  amount: number;
  description: string | null;
  status: 'created' | 'pending' | 'paid' | 'failed' | 'refunded' | 'expired';
  payment_method: string | null;
  paid_at: Date | null;
  vtb_order_id: string | null;
  vtb_form_url: string | null;
};

type CustomerMeta = {
  email?: string | null;
  phone?: string | null;
};

function buildOrderDescription(cellNumber?: number, duration?: number, description?: string): string {
  if (description) return description;
  return `Аренда ячейки №${cellNumber || ''} на ${duration || ''} мес.`.trim();
}

function normalizePhone(phone?: string | null): string | undefined {
  if (!phone) return undefined;

  const digits = phone.replace(/\D/g, '');
  if (digits.length === 11 && digits.startsWith('8')) {
    return `7${digits.slice(1)}`;
  }
  if (digits.length === 11 && digits.startsWith('7')) {
    return digits;
  }

  return undefined;
}

function toRubles(amountKopecks: number): number {
  return Number((amountKopecks / 100).toFixed(2));
}

function mapMerchantStatus(order: VtbOrderResponse | null | undefined): PaymentDbRow['status'] {
  const orderStatus = getVtbStatusValue(order?.object);
  const paymentObject = getOrderPaymentObject(order);
  const paymentStatus = getVtbStatusValue(paymentObject);

  if (paymentStatus === 'CONFIRMED' || orderStatus === 'PAID') return 'paid';
  if (orderStatus === 'REFUNDED' || orderStatus === 'PARTIALLY_REFUNDED') return 'refunded';
  if (orderStatus === 'EXPIRED') return 'expired';
  if (paymentStatus === 'DECLINED' || orderStatus === 'CANCELED' || orderStatus === 'VOIDED') return 'failed';
  if (paymentStatus === 'AUTHORIZED' || orderStatus === 'PENDING') return 'pending';
  if (orderStatus === 'CREATED' || orderStatus === 'LCREATED' || paymentStatus === 'NEW') return 'created';

  return 'pending';
}

function getPaymentMethod(order: VtbOrderResponse | null | undefined): string | null {
  const paymentType = getOrderPaymentObject(order)?.paymentData?.type;
  return paymentType ? paymentType.toUpperCase() : null;
}

function getGatewayPaymentId(order: VtbOrderResponse | null | undefined): string | null {
  return getOrderPaymentObject(order)?.paymentId || null;
}

async function fetchCustomerMeta(customerId: string): Promise<CustomerMeta | null> {
  const [rows] = await pool.query('SELECT email, phone FROM customers WHERE id = ? LIMIT 1', [customerId]);
  return ((rows as CustomerMeta[])[0] || null);
}

async function fetchPayment(paymentId: string): Promise<PaymentDbRow> {
  const [rows] = await pool.query('SELECT * FROM payments WHERE id = ?', [paymentId]);
  const payment = (rows as PaymentDbRow[])[0];

  if (!payment) {
    throw new AppError('Платёж не найден', 404);
  }

  return payment;
}

async function activateRental(payment: PaymentDbRow): Promise<void> {
  if (payment.rental_id) {
    await pool.query(
      "UPDATE rentals SET status = 'active' WHERE id = ? AND status != 'active'",
      [payment.rental_id]
    );
  }

  if (payment.cell_id) {
    await pool.query(
      "UPDATE cells SET status = 'occupied', reserved_until = NULL WHERE id = ?",
      [payment.cell_id]
    );
  }
}

async function updatePaymentState(
  payment: PaymentDbRow,
  nextStatus: PaymentDbRow['status'],
  gatewayPayload: unknown,
  paymentMethod?: string | null,
  paidAt?: Date | null
): Promise<void> {
  const resolvedPaidAt = nextStatus === 'paid'
    ? (payment.paid_at || paidAt || new Date())
    : payment.paid_at;

  await pool.query(
    `UPDATE payments
     SET status = ?, payment_method = ?, paid_at = ?, vtb_response = ?, updated_at = NOW()
     WHERE id = ?`,
    [
      nextStatus,
      paymentMethod ?? payment.payment_method ?? null,
      resolvedPaidAt,
      JSON.stringify(gatewayPayload),
      payment.id,
    ]
  );

  if (nextStatus === 'paid' && payment.status !== 'paid') {
    await activateRental(payment);
  }
}

function extractCallbackStatus(payload: VtbCallbackPayload): PaymentDbRow['status'] {
  const status = getVtbStatusValue(payload.object);

  if (payload.type === 'REFUND') {
    return 'refunded';
  }

  if (status === 'CONFIRMED') return 'paid';
  if (status === 'DECLINED' || status === 'REVERSED') return 'failed';
  if (status === 'AUTHORIZED' || status === 'NEW') return 'pending';

  return 'pending';
}

paymentsRouter.post('/create', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { rentalId, customerId, cellId, amount, duration, cellNumber, description } = req.body;

    if (!customerId || !amount) {
      throw new AppError('Обязательные поля: customerId, amount', 400);
    }

    const numericAmount = Number(amount);
    const amountKopecks = Math.round(numericAmount * 100);
    if (!Number.isFinite(amountKopecks) || amountKopecks <= 0) {
      throw new AppError('Некорректная сумма платежа', 400);
    }

    const paymentId = uuidv4();
    const orderDescription = buildOrderDescription(cellNumber, duration, description);
    const returnUrl = `${SITE_URL}/payment/success?paymentId=${paymentId}`;
    const expire = new Date(Date.now() + ORDER_EXPIRE_MINUTES * 60 * 1000).toISOString();

    const customer = await fetchCustomerMeta(customerId);
    const orderResponse = await createMerchantOrder({
      orderId: paymentId,
      orderName: orderDescription,
      expire,
      returnUrl,
      amount: {
        value: toRubles(amountKopecks),
        code: 'RUB',
      },
      customer: {
        customerId,
        email: customer?.email || undefined,
        phone: normalizePhone(customer?.phone),
      },
      additionalInfo: `cell:${cellNumber || ''},duration:${duration || ''}`,
    });

    const payUrl = orderResponse.object?.payUrl;
    if (!payUrl) {
      throw new AppError('VTB Merchant API не вернул ссылку на оплату', 502);
    }

    await pool.query(
      `INSERT INTO payments (id, rental_id, customer_id, cell_id, amount, description, vtb_order_id, vtb_form_url, status, return_url, fail_url, client_ip, vtb_response)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        paymentId,
        rentalId || null,
        customerId,
        cellId || null,
        amountKopecks,
        orderDescription,
        orderResponse.object?.orderCode || null,
        payUrl,
        mapMerchantStatus(orderResponse),
        returnUrl,
        `${SITE_URL}/payment/fail?paymentId=${paymentId}`,
        req.ip || null,
        JSON.stringify(orderResponse),
      ]
    );

    res.json({
      success: true,
      data: {
        paymentId,
        formUrl: payUrl,
        vtbOrderId: orderResponse.object?.orderCode || paymentId,
      },
    });
  } catch (error) {
    next(error);
  }
});

paymentsRouter.post('/callback', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const payload = req.body as VtbCallbackPayload;
    const orderId = payload?.object?.orderId;

    if (!payload?.type || !orderId) {
      throw new AppError('Некорректный callback от платёжного шлюза', 400);
    }

    const payment = await fetchPayment(orderId);
    const nextStatus = extractCallbackStatus(payload);
    const paymentMethod = payload.type === 'PAYMENT'
      ? payload.object?.paymentData?.type?.toUpperCase() || null
      : payment.payment_method;
    const statusChangedAt = getVtbStatusChangedAt(payload.object);

    await updatePaymentState(
      payment,
      nextStatus,
      payload,
      paymentMethod,
      statusChangedAt ? new Date(statusChangedAt) : undefined
    );

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

paymentsRouter.get('/:id/status', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const payment = await fetchPayment(req.params.id as string);

    if (['paid', 'refunded', 'failed', 'expired'].includes(payment.status)) {
      return res.json({
        success: true,
        data: {
          paymentId: payment.id,
          status: payment.status,
          amount: toRubles(payment.amount),
          paidAt: payment.paid_at,
        },
      });
    }

    const orderResponse = await getMerchantOrder(payment.id);
    const nextStatus = mapMerchantStatus(orderResponse);
    const paymentMethod = getPaymentMethod(orderResponse);
    const paidAtSource = getVtbStatusChangedAt(getOrderPaymentObject(orderResponse)) || getVtbStatusChangedAt(orderResponse.object);

    await updatePaymentState(
      payment,
      nextStatus,
      orderResponse,
      paymentMethod,
      paidAtSource ? new Date(paidAtSource) : undefined
    );

    res.json({
      success: true,
      data: {
        paymentId: payment.id,
        status: nextStatus,
        amount: toRubles(payment.amount),
        paidAt: nextStatus === 'paid' ? (payment.paid_at || (paidAtSource ? new Date(paidAtSource) : null)) : null,
        vtbOrderStatus: getVtbStatusValue(orderResponse.object),
      },
    });
  } catch (error) {
    next(error);
  }
});

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

    if (status) {
      query += ' AND p.status = ?';
      params.push(status);
    }
    if (customer_id) {
      query += ' AND p.customer_id = ?';
      params.push(customer_id);
    }

    query += ' ORDER BY p.created_at DESC';

    const [rows] = await pool.query(query, params);

    const payments = (rows as any[]).map((payment) => ({
      ...payment,
      amount: toRubles(payment.amount),
    }));

    res.json({ success: true, data: payments });
  } catch (error) {
    next(error);
  }
});

paymentsRouter.post('/:id/refund', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const payment = await fetchPayment(req.params.id);
    if (payment.status !== 'paid') {
      throw new AppError('Можно вернуть только оплаченный платёж', 400);
    }

    const orderResponse = await getMerchantOrder(payment.id);
    const gatewayPaymentId = getGatewayPaymentId(orderResponse);
    if (!gatewayPaymentId) {
      throw new AppError('Не найден paymentId транзакции в ответе VTB', 502);
    }

    const requestedAmount = req.body.amount ? Number(req.body.amount) : toRubles(payment.amount);
    const refundAmountKopecks = Math.round(requestedAmount * 100);
    if (!Number.isFinite(refundAmountKopecks) || refundAmountKopecks <= 0) {
      throw new AppError('Некорректная сумма возврата', 400);
    }

    const refundResponse = await createMerchantRefund({
      refundId: uuidv4(),
      paymentId: gatewayPaymentId,
      amount: {
        value: toRubles(refundAmountKopecks),
        code: 'RUB',
      },
    });

    await updatePaymentState(payment, 'refunded', refundResponse, payment.payment_method);

    res.json({ success: true, message: 'Возврат создан' });
  } catch (error) {
    next(error);
  }
});
