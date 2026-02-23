import { Router, Request, Response, NextFunction } from 'express';
import pool from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { v4 as uuidv4 } from 'uuid';

export const rentalsRouter = Router();

// GET /api/rentals — все аренды (с фильтрами)
rentalsRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status, cell_id, customer_id } = req.query;

    let query = `
      SELECT 
        r.id, r.cell_id AS cellId, r.customer_id AS customerId,
        r.start_date AS startDate, r.end_date AS endDate,
        r.duration_months AS months, r.monthly_price AS pricePerMonth,
        r.discount_percent AS discount, r.total_amount AS totalAmount,
        r.auto_renew AS autoRenew, r.status, r.notes,
        r.created_at AS createdAt,
        c.name AS customerName, c.phone AS customerPhone, 
        c.email AS customerEmail, c.type AS customerType,
        cl.number AS cellNumber
      FROM rentals r
      JOIN customers c ON r.customer_id = c.id
      JOIN cells cl ON r.cell_id = cl.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (status) {
      query += ' AND r.status = ?';
      params.push(status);
    }
    if (cell_id) {
      query += ' AND r.cell_id = ?';
      params.push(cell_id);
    }
    if (customer_id) {
      query += ' AND r.customer_id = ?';
      params.push(customer_id);
    }

    query += ' ORDER BY r.created_at DESC';

    const [rows] = await pool.query(query, params);

    const rentals = (rows as any[]).map(r => ({
      ...r,
      autoRenew: !!r.autoRenew,
    }));

    res.json({ success: true, data: rentals });
  } catch (error) {
    next(error);
  }
});

// GET /api/rentals/:id
rentalsRouter.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const [rows] = await pool.query(
      `SELECT 
        r.id, r.cell_id AS cellId, r.customer_id AS customerId,
        r.start_date AS startDate, r.end_date AS endDate,
        r.duration_months AS months, r.monthly_price AS pricePerMonth,
        r.discount_percent AS discount, r.total_amount AS totalAmount,
        r.auto_renew AS autoRenew, r.status, r.notes,
        c.name AS customerName, c.phone AS customerPhone,
        c.email AS customerEmail, c.type AS customerType
      FROM rentals r
      JOIN customers c ON r.customer_id = c.id
      WHERE r.id = ?`,
      [req.params.id]
    );
    const data = rows as any[];
    if (data.length === 0) throw new AppError('Аренда не найдена', 404);
    
    const rental = data[0];
    rental.autoRenew = !!rental.autoRenew;
    
    res.json({ success: true, data: rental });
  } catch (error) {
    next(error);
  }
});

// POST /api/rentals — создать аренду
rentalsRouter.post('/', async (req: Request, res: Response, next: NextFunction) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const { cellId, customerId, startDate, months, pricePerMonth, discount, totalAmount, autoRenew, notes } = req.body;

    if (!cellId || !customerId || !startDate || !months || !pricePerMonth) {
      throw new AppError('Обязательные поля: cellId, customerId, startDate, months, pricePerMonth', 400);
    }

    // Проверяем что ячейка свободна
    const [cellRows] = await conn.query('SELECT status FROM cells WHERE id = ? FOR UPDATE', [cellId]);
    const cell = (cellRows as any[])[0];
    if (!cell) throw new AppError('Ячейка не найдена', 404);
    if (cell.status === 'occupied') throw new AppError('Ячейка уже занята', 400);

    // Вычислить дату окончания
    const start = new Date(startDate);
    const end = new Date(start);
    end.setMonth(end.getMonth() + months);
    const endDate = end.toISOString().split('T')[0];

    const id = req.body.id || uuidv4();

    // Создаём аренду
    await conn.query(
      `INSERT INTO rentals (id, cell_id, customer_id, start_date, end_date, duration_months, monthly_price, discount_percent, total_amount, auto_renew, status, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', ?)`,
      [id, cellId, customerId, startDate, endDate, months, pricePerMonth, discount || 0, totalAmount || pricePerMonth * months, autoRenew || false, notes || null]
    );

    // Обновляем статус ячейки
    await conn.query("UPDATE cells SET status = 'occupied', reserved_until = NULL WHERE id = ?", [cellId]);

    await conn.commit();

    res.status(201).json({ success: true, data: { id, endDate }, message: 'Аренда оформлена' });
  } catch (error) {
    await conn.rollback();
    next(error);
  } finally {
    conn.release();
  }
});

// PUT /api/rentals/:id/extend — продлить аренду
rentalsRouter.put('/:id/extend', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { months } = req.body;
    if (!months || months < 1) throw new AppError('Укажите количество месяцев', 400);

    const [rows] = await pool.query('SELECT * FROM rentals WHERE id = ?', [req.params.id]);
    const rental = (rows as any[])[0];
    if (!rental) throw new AppError('Аренда не найдена', 404);

    const newEnd = new Date(rental.end_date);
    newEnd.setMonth(newEnd.getMonth() + months);
    const newEndDate = newEnd.toISOString().split('T')[0];

    await pool.query(
      'UPDATE rentals SET end_date = ?, duration_months = duration_months + ? WHERE id = ?',
      [newEndDate, months, req.params.id]
    );

    res.json({ success: true, data: { endDate: newEndDate }, message: `Аренда продлена на ${months} мес.` });
  } catch (error) {
    next(error);
  }
});

// PUT /api/rentals/:id/release — освободить ячейку (завершить аренду)
rentalsRouter.put('/:id/release', async (req: Request, res: Response, next: NextFunction) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [rows] = await conn.query('SELECT * FROM rentals WHERE id = ? FOR UPDATE', [req.params.id]);
    const rental = (rows as any[])[0];
    if (!rental) throw new AppError('Аренда не найдена', 404);

    // Завершаем аренду
    await conn.query(
      "UPDATE rentals SET status = 'expired', end_date = CURDATE() WHERE id = ?",
      [req.params.id]
    );

    // Освобождаем ячейку
    await conn.query(
      "UPDATE cells SET status = 'available', reserved_until = NULL WHERE id = ?",
      [rental.cell_id]
    );

    await conn.commit();
    res.json({ success: true, message: 'Ячейка освобождена' });
  } catch (error) {
    await conn.rollback();
    next(error);
  } finally {
    conn.release();
  }
});

// DELETE /api/rentals/:id
rentalsRouter.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const [result] = await pool.query('DELETE FROM rentals WHERE id = ?', [req.params.id]);
    if ((result as any).affectedRows === 0) throw new AppError('Аренда не найдена', 404);
    res.json({ success: true, message: 'Аренда удалена' });
  } catch (error) {
    next(error);
  }
});
