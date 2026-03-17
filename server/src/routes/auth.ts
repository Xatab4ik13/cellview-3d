import { Router, Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { sendEmail } from '../config/mailer';

export const authRouter = Router();

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_jwt_secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const SITE_URL = process.env.CORS_ORIGIN?.split(',')[0] || 'https://kladovka78.ru';

function generateToken(customerId: string) {
  return jwt.sign({ id: customerId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as any);
}

// POST /api/auth/register
authRouter.post(
  '/register',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, email, phone, password } = req.body;

      if (!name || !email || !password) {
        throw new AppError('Имя, email и пароль обязательны', 400);
      }

      // Check if email already exists
      const [existing] = await pool.query(
        'SELECT id FROM customers WHERE email = ?',
        [email]
      );
      if ((existing as any[]).length > 0) {
        throw new AppError('Пользователь с таким email уже существует', 409);
      }

      const id = crypto.randomUUID();
      const passwordHash = await bcrypt.hash(password, 12);

      await pool.query(
        `INSERT INTO customers (id, name, email, phone, password_hash, type) 
         VALUES (?, ?, ?, ?, ?, 'individual')`,
        [id, name, email, phone || null, passwordHash]
      );

      const token = generateToken(id);

      res.json({
        success: true,
        data: {
          token,
          customer: { id, name, email, phone: phone || null, type: 'individual' },
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/auth/login
authRouter.post(
  '/login',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        throw new AppError('Email и пароль обязательны', 400);
      }

      const [rows] = await pool.query(
        'SELECT id, name, email, phone, type, password_hash FROM customers WHERE email = ?',
        [email]
      );

      const customer = (rows as any[])[0];

      if (!customer || !customer.password_hash) {
        throw new AppError('Неверный email или пароль', 401);
      }

      const valid = await bcrypt.compare(password, customer.password_hash);
      if (!valid) {
        throw new AppError('Неверный email или пароль', 401);
      }

      const token = generateToken(customer.id);

      res.json({
        success: true,
        data: {
          token,
          customer: {
            id: customer.id,
            name: customer.name,
            email: customer.email,
            phone: customer.phone,
            type: customer.type,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/auth/forgot-password
authRouter.post(
  '/forgot-password',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email } = req.body;

      if (!email) {
        throw new AppError('Email обязателен', 400);
      }

      const [rows] = await pool.query(
        'SELECT id, name FROM customers WHERE email = ?',
        [email]
      );

      const customer = (rows as any[])[0];

      // Always respond with success to prevent email enumeration
      if (!customer) {
        res.json({ success: true, data: { message: 'Если email зарегистрирован, письмо отправлено' } });
        return;
      }

      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      await pool.query(
        'INSERT INTO password_reset_tokens (customer_id, token, expires_at) VALUES (?, ?, ?)',
        [customer.id, resetToken, expiresAt]
      );

      const resetUrl = `${SITE_URL}/reset-password?token=${resetToken}`;

      await sendEmail(
        email,
        'Сброс пароля — Кладовка78',
        `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
          <h2 style="color: #1a1a1a; margin-bottom: 16px;">Сброс пароля</h2>
          <p style="color: #555; line-height: 1.6;">
            Здравствуйте, ${customer.name}!
          </p>
          <p style="color: #555; line-height: 1.6;">
            Вы запросили сброс пароля. Нажмите кнопку ниже:
          </p>
          <div style="text-align: center; margin: 32px 0;">
            <a href="${resetUrl}" 
               style="background: #f97316; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">
              Сбросить пароль
            </a>
          </div>
          <p style="color: #999; font-size: 13px;">
            Ссылка действительна 1 час. Если вы не запрашивали сброс — проигнорируйте письмо.
          </p>
        </div>
        `
      );

      res.json({ success: true, data: { message: 'Если email зарегистрирован, письмо отправлено' } });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/auth/reset-password
authRouter.post(
  '/reset-password',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { token, password } = req.body;

      if (!token || !password) {
        throw new AppError('Токен и новый пароль обязательны', 400);
      }

      if (password.length < 6) {
        throw new AppError('Пароль должен быть не менее 6 символов', 400);
      }

      const [rows] = await pool.query(
        `SELECT * FROM password_reset_tokens 
         WHERE token = ? AND used = 0 AND expires_at > NOW()`,
        [token]
      );

      const resetRow = (rows as any[])[0];
      if (!resetRow) {
        throw new AppError('Ссылка недействительна или истекла', 400);
      }

      const passwordHash = await bcrypt.hash(password, 12);

      await pool.query('UPDATE customers SET password_hash = ? WHERE id = ?', [
        passwordHash,
        resetRow.customer_id,
      ]);

      await pool.query('UPDATE password_reset_tokens SET used = 1 WHERE token = ?', [token]);

      res.json({ success: true, data: { message: 'Пароль успешно изменён' } });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/auth/me — verify JWT and return customer
authRouter.get(
  '/me',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader?.startsWith('Bearer ')) {
        throw new AppError('Не авторизован', 401);
      }

      const decoded = jwt.verify(authHeader.slice(7), JWT_SECRET) as { id: string };

      const [customers] = await pool.query(
        'SELECT id, name, phone, email, type FROM customers WHERE id = ?',
        [decoded.id]
      );

      const customer = (customers as any[])[0];
      if (!customer) {
        throw new AppError('Клиент не найден', 404);
      }

      res.json({ success: true, data: customer });
    } catch (error: any) {
      if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
        next(new AppError('Токен недействителен', 401));
      } else {
        next(error);
      }
    }
  }
);
