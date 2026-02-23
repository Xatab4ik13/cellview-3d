import { Router, Request, Response, NextFunction } from 'express';
import pool from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { v4 as uuidv4 } from 'uuid';

export const customersRouter = Router();

// GET /api/customers — список клиентов
customersRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { search, type } = req.query;

    let query = `
      SELECT id, type, name, phone, email, telegram,
        passport_series AS passportSeries, passport_number AS passportNumber,
        company_name AS companyName, inn, ogrn, contact_person AS contactPerson,
        notes, created_at AS createdAt
      FROM customers
      WHERE 1=1
    `;
    const params: any[] = [];

    if (search) {
      query += ' AND (name LIKE ? OR phone LIKE ? OR email LIKE ?)';
      const s = `%${search}%`;
      params.push(s, s, s);
    }
    if (type && (type === 'individual' || type === 'company')) {
      query += ' AND type = ?';
      params.push(type);
    }

    query += ' ORDER BY created_at DESC';

    const [rows] = await pool.query(query, params);
    res.json({ success: true, data: rows });
  } catch (error) {
    next(error);
  }
});

// GET /api/customers/:id
customersRouter.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, type, name, phone, email, telegram,
        passport_series AS passportSeries, passport_number AS passportNumber,
        company_name AS companyName, inn, ogrn, contact_person AS contactPerson,
        notes, created_at AS createdAt
      FROM customers WHERE id = ?`,
      [req.params.id]
    );
    const data = rows as any[];
    if (data.length === 0) throw new AppError('Клиент не найден', 404);
    res.json({ success: true, data: data[0] });
  } catch (error) {
    next(error);
  }
});

// POST /api/customers
customersRouter.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { type, name, phone, email, telegram, passportSeries, passportNumber, companyName, inn, ogrn, contactPerson, notes } = req.body;

    if (!name || !phone) {
      throw new AppError('Обязательные поля: name, phone', 400);
    }

    const id = req.body.id || uuidv4();

    await pool.query(
      `INSERT INTO customers (id, type, name, phone, email, telegram, passport_series, passport_number, company_name, inn, ogrn, contact_person, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, type || 'individual', name, phone, email || null, telegram || null, passportSeries || null, passportNumber || null, companyName || null, inn || null, ogrn || null, contactPerson || null, notes || null]
    );

    res.status(201).json({ success: true, data: { id }, message: 'Клиент создан' });
  } catch (error) {
    next(error);
  }
});

// PUT /api/customers/:id
customersRouter.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { type, name, phone, email, telegram, passportSeries, passportNumber, companyName, inn, ogrn, contactPerson, notes } = req.body;

    const [result] = await pool.query(
      `UPDATE customers SET
        type = COALESCE(?, type),
        name = COALESCE(?, name),
        phone = COALESCE(?, phone),
        email = ?,
        telegram = ?,
        passport_series = ?,
        passport_number = ?,
        company_name = ?,
        inn = ?,
        ogrn = ?,
        contact_person = ?,
        notes = ?
      WHERE id = ?`,
      [type, name, phone, email ?? null, telegram ?? null, passportSeries ?? null, passportNumber ?? null, companyName ?? null, inn ?? null, ogrn ?? null, contactPerson ?? null, notes ?? null, req.params.id]
    );

    if ((result as any).affectedRows === 0) throw new AppError('Клиент не найден', 404);
    res.json({ success: true, message: 'Клиент обновлён' });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/customers/:id
customersRouter.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Проверяем нет ли активных аренд
    const [activeRentals] = await pool.query(
      'SELECT id FROM rentals WHERE customer_id = ? AND status = "active"',
      [req.params.id]
    );
    if ((activeRentals as any[]).length > 0) {
      throw new AppError('Невозможно удалить клиента с активными арендами', 400);
    }

    const [result] = await pool.query('DELETE FROM customers WHERE id = ?', [req.params.id]);
    if ((result as any).affectedRows === 0) throw new AppError('Клиент не найден', 404);
    res.json({ success: true, message: 'Клиент удалён' });
  } catch (error) {
    next(error);
  }
});
