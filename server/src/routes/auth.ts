import { Router, Request, Response, NextFunction } from 'express';
import pool from '../config/database';
import { AppError } from '../middleware/errorHandler';

export const authRouter = Router();

// POST /api/auth/verify-token — verify one-time token from Telegram bot
authRouter.post(
  '/verify-token',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { token } = req.body;

      if (!token) {
        throw new AppError('Токен не указан', 400);
      }

      // Find valid, unused, non-expired token
      const [tokens] = await pool.query(
        `SELECT t.*, c.id as cid, c.name, c.phone, c.email, c.telegram, c.type
         FROM auth_tokens t
         JOIN customers c ON t.customer_id = c.id
         WHERE t.token = ? AND t.used = 0 AND t.expires_at > NOW()`,
        [token]
      );

      const row = (tokens as any[])[0];

      if (!row) {
        throw new AppError('Токен недействителен или истёк', 401);
      }

      // Mark token as used
      await pool.query('UPDATE auth_tokens SET used = 1 WHERE token = ?', [token]);

      // Return customer data
      res.json({
        success: true,
        data: {
          id: row.cid,
          name: row.name,
          phone: row.phone,
          email: row.email,
          telegram: row.telegram,
          type: row.type,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/auth/me — check current session (by customer id in header)
authRouter.get(
  '/me',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const customerId = req.headers['x-customer-id'] as string;

      if (!customerId) {
        throw new AppError('Не авторизован', 401);
      }

      const [customers] = await pool.query(
        'SELECT id, name, phone, email, telegram, type FROM customers WHERE id = ?',
        [customerId]
      );

      const customer = (customers as any[])[0];

      if (!customer) {
        throw new AppError('Клиент не найден', 404);
      }

      res.json({ success: true, data: customer });
    } catch (error) {
      next(error);
    }
  }
);
