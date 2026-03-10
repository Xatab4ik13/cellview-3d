import { Router, Request, Response, NextFunction } from 'express';
import pool from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { v4 as uuidv4 } from 'uuid';

export const customersRouter = Router();

const CUSTOMER_SELECT = `
  id, type, name, phone, email, telegram,
  passport_series AS passportSeries, passport_number AS passportNumber,
  passport_issued AS passportIssued, passport_date AS passportDate,
  passport_code AS passportCode,
  birth_date AS birthDate, birth_place AS birthPlace,
  registration_address AS registrationAddress,
  company_name AS companyName, inn, ogrn, kpp,
  bank_name AS bankName, bik,
  checking_account AS checkingAccount, corr_account AS corrAccount,
  legal_address AS legalAddress,
  contact_person AS contactPerson,
  contact_person_email AS contactPersonEmail,
  contact_person_phone AS contactPersonPhone,
  notes, created_at AS createdAt
`;

// GET /api/customers — список клиентов
customersRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { search, type } = req.query;

    let query = `SELECT ${CUSTOMER_SELECT} FROM customers WHERE 1=1`;
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
      `SELECT ${CUSTOMER_SELECT} FROM customers WHERE id = ?`,
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
    const b = req.body;

    if (!b.name || !b.phone) {
      throw new AppError('Обязательные поля: name, phone', 400);
    }

    const id = b.id || uuidv4();

    await pool.query(
      `INSERT INTO customers (id, type, name, phone, email, telegram,
        passport_series, passport_number, passport_issued, passport_date, passport_code,
        birth_date, birth_place, registration_address,
        company_name, inn, ogrn, kpp,
        bank_name, bik, checking_account, corr_account, legal_address,
        contact_person, contact_person_email, contact_person_phone, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id, b.type || 'individual', b.name, b.phone,
        b.email || null, b.telegram || null,
        b.passportSeries || null, b.passportNumber || null,
        b.passportIssued || null, b.passportDate || null, b.passportCode || null,
        b.birthDate || null, b.birthPlace || null, b.registrationAddress || null,
        b.companyName || null, b.inn || null, b.ogrn || null, b.kpp || null,
        b.bankName || null, b.bik || null, b.checkingAccount || null, b.corrAccount || null,
        b.legalAddress || null,
        b.contactPerson || null, b.contactPersonEmail || null, b.contactPersonPhone || null,
        b.notes || null,
      ]
    );

    res.status(201).json({ success: true, data: { id }, message: 'Клиент создан' });
  } catch (error) {
    next(error);
  }
});

// PUT /api/customers/:id
customersRouter.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const b = req.body;

    const [result] = await pool.query(
      `UPDATE customers SET
        type = COALESCE(?, type),
        name = COALESCE(?, name),
        phone = COALESCE(?, phone),
        email = ?,
        telegram = ?,
        passport_series = ?,
        passport_number = ?,
        passport_issued = ?,
        passport_date = ?,
        passport_code = ?,
        birth_date = ?,
        birth_place = ?,
        registration_address = ?,
        company_name = ?,
        inn = ?,
        ogrn = ?,
        kpp = ?,
        bank_name = ?,
        bik = ?,
        checking_account = ?,
        corr_account = ?,
        legal_address = ?,
        contact_person = ?,
        contact_person_email = ?,
        contact_person_phone = ?,
        notes = ?
      WHERE id = ?`,
      [
        b.type, b.name, b.phone,
        b.email ?? null, b.telegram ?? null,
        b.passportSeries ?? null, b.passportNumber ?? null,
        b.passportIssued ?? null, b.passportDate ?? null, b.passportCode ?? null,
        b.birthDate ?? null, b.birthPlace ?? null, b.registrationAddress ?? null,
        b.companyName ?? null, b.inn ?? null, b.ogrn ?? null, b.kpp ?? null,
        b.bankName ?? null, b.bik ?? null, b.checkingAccount ?? null, b.corrAccount ?? null,
        b.legalAddress ?? null,
        b.contactPerson ?? null, b.contactPersonEmail ?? null, b.contactPersonPhone ?? null,
        b.notes ?? null,
        req.params.id,
      ]
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
