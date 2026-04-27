import { Router, Request, Response, NextFunction } from 'express';
import pool from '../config/database';

export const revenueRouter = Router();

// GET /api/revenue?from=2026-01&to=2026-12
// Возвращает агрегаты по месяцам: ФАКТ (распределённая выручка) и ПЛАН (распределённая выручка по будущим месяцам активных аренд)
revenueRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { from, to } = req.query;

    let query = `
      SELECT 
        DATE_FORMAT(month, '%Y-%m') as month,
        SUM(amount) as total,
        COUNT(DISTINCT rental_id) as rentals,
        COUNT(DISTINCT customer_id) as customers
      FROM revenue_entries
      WHERE 1=1
    `;
    const params: any[] = [];

    if (from) {
      query += ' AND month >= ?';
      params.push(`${from}-01`);
    }
    if (to) {
      query += ' AND month <= ?';
      params.push(`${to}-31`);
    }

    query += " GROUP BY DATE_FORMAT(month, '%Y-%m') ORDER BY month ASC";

    const [rows] = await pool.query(query, params);
    res.json({ success: true, data: rows });
  } catch (error) {
    next(error);
  }
});

// GET /api/revenue/by-month/:month  (формат YYYY-MM)
// Детализация: какие аренды/платежи формируют выручку этого месяца
revenueRouter.get('/by-month/:month', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const month = String(req.params.month || ''); // YYYY-MM
    if (!/^\d{4}-\d{2}$/.test(month)) {
      return res.status(400).json({ success: false, message: 'Формат месяца: YYYY-MM' });
    }
    const monthStart = `${month}-01`;

    const [rows] = await pool.query(
      `SELECT 
        re.id,
        re.amount,
        re.rental_id    AS rentalId,
        re.cell_id      AS cellId,
        re.customer_id  AS customerId,
        re.payment_id   AS paymentId,
        c.name          AS customerName,
        c.phone         AS customerPhone,
        cl.number       AS cellNumber,
        r.start_date    AS rentalStart,
        r.end_date      AS rentalEnd,
        r.duration_months AS rentalMonths,
        r.monthly_price AS pricePerMonth,
        r.total_amount  AS totalAmount,
        r.status        AS rentalStatus,
        p.amount        AS paymentAmount,
        p.created_at    AS paymentDate,
        p.status        AS paymentStatus
      FROM revenue_entries re
      LEFT JOIN customers c ON re.customer_id = c.id
      LEFT JOIN cells cl    ON re.cell_id     = cl.id
      LEFT JOIN rentals r   ON re.rental_id   = r.id
      LEFT JOIN payments p  ON re.payment_id  = p.id
      WHERE re.month = ?
      ORDER BY cl.number ASC`,
      [monthStart]
    );

    const entries = rows as any[];
    const total = entries.reduce((s, e) => s + Number(e.amount || 0), 0);

    res.json({
      success: true,
      data: {
        month,
        total,
        count: entries.length,
        entries,
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/revenue/by-rental/:rentalId
revenueRouter.get('/by-rental/:rentalId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, month, amount, payment_id FROM revenue_entries WHERE rental_id = ? ORDER BY month ASC`,
      [req.params.rentalId]
    );
    res.json({ success: true, data: rows });
  } catch (error) {
    next(error);
  }
});
