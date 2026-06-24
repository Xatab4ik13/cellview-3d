import { Router, Request, Response, NextFunction } from 'express';
import pool from '../config/database';

export const revenueRouter = Router();

// Кассовый метод: выручка = оплаченные платежи в месяце оплаты (paid_at).
// Суммы в payments.amount хранятся в копейках, переводим в рубли.

// GET /api/revenue?from=YYYY-MM&to=YYYY-MM
// Агрегаты по месяцам: total (руб), payments (кол-во), customers (уникальные)
revenueRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { from, to } = req.query as { from?: string; to?: string };

    const params: any[] = [];
    let where = "WHERE p.status = 'paid' AND p.paid_at IS NOT NULL";

    if (from) {
      where += ' AND p.paid_at >= ?';
      params.push(`${from}-01 00:00:00`);
    }
    if (to) {
      where += ' AND p.paid_at < DATE_ADD(?, INTERVAL 1 MONTH)';
      params.push(`${to}-01`);
    }

    const [rows] = await pool.query(
      `SELECT
         DATE_FORMAT(p.paid_at, '%Y-%m')           AS month,
         ROUND(SUM(p.amount) / 100)                AS total,
         COUNT(*)                                  AS payments,
         COUNT(DISTINCT p.customer_id)             AS customers
       FROM payments p
       ${where}
       GROUP BY DATE_FORMAT(p.paid_at, '%Y-%m')
       ORDER BY month ASC`,
      params
    );

    res.json({ success: true, data: rows });
  } catch (error) {
    next(error);
  }
});

// GET /api/revenue/by-month/:month  (YYYY-MM)
// Список платежей этого месяца + сумма
revenueRouter.get('/by-month/:month', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const month = String(req.params.month || '');
    if (!/^\d{4}-\d{2}$/.test(month)) {
      return res.status(400).json({ success: false, message: 'Формат месяца: YYYY-MM' });
    }

    const [rows] = await pool.query(
      `SELECT
         p.id                AS id,
         p.paid_at           AS paidAt,
         ROUND(p.amount/100) AS amount,
         p.payment_method    AS paymentMethod,
         p.description       AS description,
         p.duration_months   AS durationMonths,
         p.rental_id         AS rentalId,
         c.id                AS customerId,
         c.name              AS customerName,
         c.phone             AS customerPhone,
         cl.number           AS cellNumber
       FROM payments p
       LEFT JOIN customers c ON p.customer_id = c.id
       LEFT JOIN cells     cl ON p.cell_id     = cl.id
       WHERE p.status = 'paid'
         AND p.paid_at IS NOT NULL
         AND DATE_FORMAT(p.paid_at, '%Y-%m') = ?
       ORDER BY p.paid_at DESC`,
      [month]
    );

    const entries = rows as any[];
    const total = entries.reduce((s, e) => s + Number(e.amount || 0), 0);
    const customers = new Set(entries.map(e => e.customerId)).size;

    res.json({
      success: true,
      data: { month, total, count: entries.length, customers, entries },
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/revenue/forecast/:month  (YYYY-MM)
// Прогноз продлений: активные аренды, заканчивающиеся в этом месяце.
// Сумма прогноза = pricePerMonth * duration_months (тот же срок, что и текущая аренда).
revenueRouter.get('/forecast/:month', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const month = String(req.params.month || '');
    if (!/^\d{4}-\d{2}$/.test(month)) {
      return res.status(400).json({ success: false, message: 'Формат месяца: YYYY-MM' });
    }

    const [rows] = await pool.query(
      `SELECT
         r.id              AS rentalId,
         r.end_date        AS endDate,
         r.duration_months AS durationMonths,
         r.monthly_price   AS pricePerMonth,
         (r.monthly_price * r.duration_months) AS forecastAmount,
         c.id              AS customerId,
         c.name            AS customerName,
         c.phone           AS customerPhone,
         cl.number         AS cellNumber
       FROM rentals r
       LEFT JOIN customers c ON r.customer_id = c.id
       LEFT JOIN cells     cl ON r.cell_id     = cl.id
       WHERE r.status = 'active'
         AND DATE_FORMAT(r.end_date, '%Y-%m') = ?
       ORDER BY r.end_date ASC`,
      [month]
    );

    const entries = rows as any[];
    const total = entries.reduce((s, e) => s + Number(e.forecastAmount || 0), 0);

    res.json({
      success: true,
      data: { month, total, count: entries.length, entries },
    });
  } catch (error) {
    next(error);
  }
});
