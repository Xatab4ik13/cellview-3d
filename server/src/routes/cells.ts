import { Router, Request, Response, NextFunction } from 'express';
import pool from '../config/database';
import { AppError } from '../middleware/errorHandler';

export const cellsRouter = Router();

// GET /api/cells — публичный каталог ячеек
cellsRouter.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        id, number, width, height, depth, area, volume,
        floor, tier, price_per_month as pricePerMonth,
        status, has_socket as hasSocket, has_shelves as hasShelves,
        reserved_until as reservedUntil
      FROM cells
      ORDER BY number ASC
    `);

    res.json({ success: true, data: rows });
  } catch (error) {
    next(error);
  }
});

// GET /api/cells/:id — одна ячейка с фото
cellsRouter.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const [cells] = await pool.query(
      'SELECT * FROM cells WHERE id = ?',
      [req.params.id]
    );

    const rows = cells as any[];
    if (rows.length === 0) {
      throw new AppError('Ячейка не найдена', 404);
    }

    const [photos] = await pool.query(
      'SELECT url, sort_order FROM cell_photos WHERE cell_id = ? ORDER BY sort_order',
      [req.params.id]
    );

    res.json({
      success: true,
      data: {
        ...rows[0],
        photos: (photos as any[]).map(p => p.url),
      },
    });
  } catch (error) {
    next(error);
  }
});
