import { Router, Request, Response, NextFunction } from 'express';
import pool from '../config/database';
import { AppError } from '../middleware/errorHandler';

export const cellsRouter = Router();

// GET /api/cells — публичный каталог с фото
cellsRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const proto = req.headers['x-forwarded-proto'] || req.protocol;
    const baseUrl = `${proto}://${req.get('host')}`;
    
    const [cells] = await pool.query(`
      SELECT 
        c.id, c.number, c.width, c.height, c.depth, c.area, c.volume,
        c.floor, c.tier, c.price_per_month as pricePerMonth,
        c.status, c.has_socket as hasSocket, c.has_shelves as hasShelves,
        c.reserved_until as reservedUntil,
        c.description
      FROM cells c
      ORDER BY c.number ASC
    `);

    // Подгрузить фото для всех ячеек
    const [photos] = await pool.query(`
      SELECT cell_id, url, sort_order 
      FROM cell_photos 
      ORDER BY cell_id, sort_order
    `);

    const photoMap = new Map<string, string[]>();
    for (const photo of photos as any[]) {
      if (!photoMap.has(photo.cell_id)) {
        photoMap.set(photo.cell_id, []);
      }
      // Преобразуем относительные пути в абсолютные URL
      const photoUrl = photo.url.startsWith('http') ? photo.url : `${baseUrl}${photo.url}`;
      photoMap.get(photo.cell_id)!.push(photoUrl);
    }

    const cellsWithPhotos = (cells as any[]).map(cell => ({
      ...cell,
      isAvailable: cell.status === 'available',
      hasSocket: !!cell.hasSocket,
      hasShelves: !!cell.hasShelves,
      photos: photoMap.get(cell.id) || [],
    }));

    res.json({ success: true, data: cellsWithPhotos });
  } catch (error) {
    next(error);
  }
});

// PUT /api/cells/recalculate-prices — пересчитать все цены по формуле 1500₽/м³
cellsRouter.put('/recalculate-prices', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const [result] = await pool.query(
      `UPDATE cells SET price_per_month = CEIL(volume * 1500 / 10) * 10`
    );
    const affected = (result as any).affectedRows || 0;
    res.json({ success: true, message: `Цены пересчитаны для ${affected} ячеек` });
  } catch (error) {
    next(error);
  }
});

// GET /api/cells/:id — одна ячейка
cellsRouter.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const proto = req.headers['x-forwarded-proto'] || req.protocol;
    const baseUrl = `${proto}://${req.get('host')}`;
    
    const [cells] = await pool.query(
      `SELECT
        id, number, width, height, depth, area, volume,
        floor, tier, price_per_month as pricePerMonth,
        status, has_socket as hasSocket, has_shelves as hasShelves,
        reserved_until as reservedUntil, description
      FROM cells WHERE id = ?`,
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

    const cell = rows[0];
    res.json({
      success: true,
      data: {
        ...cell,
        isAvailable: cell.status === 'available',
        hasSocket: !!cell.hasSocket,
        hasShelves: !!cell.hasShelves,
        photos: (photos as any[]).map(p => 
          p.url.startsWith('http') ? p.url : `${baseUrl}${p.url}`
        ),
      },
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/cells — создать ячейку (CRM)
cellsRouter.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id, number, width, height, depth, area, volume, floor, tier, pricePerMonth, status, hasSocket, hasShelves, description } = req.body;

    if (!id || !number || !width || !height || !depth) {
      throw new AppError('Обязательные поля: id, number, width, height, depth', 400);
    }

    await pool.query(
      `INSERT INTO cells (id, number, width, height, depth, area, volume, floor, tier, price_per_month, status, has_socket, has_shelves, description)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, number, width, height, depth, area || 0, volume || 0, floor || 1, tier || 1, pricePerMonth || 0, status || 'available', hasSocket || false, hasShelves || false, description || null]
    );

    res.status(201).json({ success: true, message: 'Ячейка создана' });
  } catch (error) {
    next(error);
  }
});

// PUT /api/cells/:id — обновить ячейку (CRM)
cellsRouter.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { number, width, height, depth, area, volume, floor, tier, pricePerMonth, status, hasSocket, hasShelves, reservedUntil, description } = req.body;

    const [result] = await pool.query(
      `UPDATE cells SET 
        number = COALESCE(?, number),
        width = COALESCE(?, width),
        height = COALESCE(?, height),
        depth = COALESCE(?, depth),
        area = COALESCE(?, area),
        volume = COALESCE(?, volume),
        floor = COALESCE(?, floor),
        tier = COALESCE(?, tier),
        price_per_month = COALESCE(?, price_per_month),
        status = COALESCE(?, status),
        has_socket = COALESCE(?, has_socket),
        has_shelves = COALESCE(?, has_shelves),
        reserved_until = ?,
        description = COALESCE(?, description)
      WHERE id = ?`,
      [number, width, height, depth, area, volume, floor, tier, pricePerMonth, status, hasSocket, hasShelves, reservedUntil || null, description, req.params.id]
    );

    if ((result as any).affectedRows === 0) {
      throw new AppError('Ячейка не найдена', 404);
    }

    res.json({ success: true, message: 'Ячейка обновлена' });
  } catch (error) {
    next(error);
  }
});


// DELETE /api/cells/:id — удалить ячейку (CRM)
cellsRouter.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const [result] = await pool.query('DELETE FROM cells WHERE id = ?', [req.params.id]);

    if ((result as any).affectedRows === 0) {
      throw new AppError('Ячейка не найдена', 404);
    }

    res.json({ success: true, message: 'Ячейка удалена' });
  } catch (error) {
    next(error);
  }
});
