import { Router, Request, Response, NextFunction } from 'express';
import pool from '../config/database';

export const revenueRouter = Router();

// GET /api/revenue?from=2026-01&to=2026-12
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

    query += ' GROUP BY DATE_FORMAT(month, \'%Y-%m\') ORDER BY month ASC';

    const [rows] = await pool.query(query, params);
    res.json({ success: true, data: rows });
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
