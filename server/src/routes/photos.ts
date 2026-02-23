import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import pool from '../config/database';
import { AppError } from '../middleware/errorHandler';

export const photosRouter = Router();

const UPLOAD_DIR = process.env.UPLOAD_DIR || '/var/www/kladovka78/uploads';
const CELLS_DIR = path.join(UPLOAD_DIR, 'cells');

// Ensure upload directory exists
if (!fs.existsSync(CELLS_DIR)) {
  fs.mkdirSync(CELLS_DIR, { recursive: true });
}

// Multer config
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, CELLS_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueName = `cell-${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
    cb(null, uniqueName);
  },
});

const fileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowed = ['.jpg', '.jpeg', '.png', '.webp'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.includes(ext)) {
    cb(null, true);
  } else {
    cb(new AppError('Допустимые форматы: JPG, PNG, WebP', 400));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
});

// POST /api/cells/:cellId/photos — загрузить фото (до 5 за раз)
photosRouter.post(
  '/:cellId/photos',
  upload.array('photos', 5),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { cellId } = req.params;
      const files = req.files as Express.Multer.File[];

      if (!files || files.length === 0) {
        throw new AppError('Файлы не загружены', 400);
      }

      // Verify cell exists
      const [cells] = await pool.query('SELECT id FROM cells WHERE id = ?', [cellId]);
      if ((cells as any[]).length === 0) {
        // Clean up uploaded files
        files.forEach(f => fs.unlinkSync(f.path));
        throw new AppError('Ячейка не найдена', 404);
      }

      // Get current max sort_order
      const [maxOrder] = await pool.query(
        'SELECT COALESCE(MAX(sort_order), -1) as maxOrder FROM cell_photos WHERE cell_id = ?',
        [cellId]
      );
      let sortOrder = (maxOrder as any[])[0].maxOrder + 1;

      const insertedPhotos: { url: string; sortOrder: number }[] = [];

      for (const file of files) {
        const url = `/uploads/cells/${file.filename}`;
        await pool.query(
          'INSERT INTO cell_photos (cell_id, url, sort_order) VALUES (?, ?, ?)',
          [cellId, url, sortOrder]
        );
        insertedPhotos.push({ url, sortOrder });
        sortOrder++;
      }

      // Return full URLs
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      const photosWithUrls = insertedPhotos.map(p => ({
        ...p,
        url: `${baseUrl}${p.url}`,
      }));

      res.status(201).json({ success: true, data: photosWithUrls });
    } catch (error) {
      next(error);
    }
  }
);

// DELETE /api/cells/:cellId/photos — удалить фото по URL
photosRouter.delete(
  '/:cellId/photos',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { cellId } = req.params;
      const { url } = req.body;

      if (!url) {
        throw new AppError('Укажите URL фото для удаления', 400);
      }

      // Extract relative path from full URL
      const relativePath = url.replace(/^https?:\/\/[^/]+/, '');

      // Delete from database
      const [result] = await pool.query(
        'DELETE FROM cell_photos WHERE cell_id = ? AND url = ?',
        [cellId, relativePath]
      );

      if ((result as any).affectedRows === 0) {
        throw new AppError('Фото не найдено', 404);
      }

      // Delete file from disk
      const filePath = path.join(UPLOAD_DIR, relativePath.replace('/uploads/', ''));
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      res.json({ success: true, message: 'Фото удалено' });
    } catch (error) {
      next(error);
    }
  }
);
