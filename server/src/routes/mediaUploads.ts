import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { AppError } from '../middleware/errorHandler';

export const mediaUploadsRouter = Router();

const UPLOAD_DIR = process.env.UPLOAD_DIR || '/var/www/kladovka78/uploads';
const MEDIA_DIR = path.join(UPLOAD_DIR, 'media');

if (!fs.existsSync(MEDIA_DIR)) {
  fs.mkdirSync(MEDIA_DIR, { recursive: true });
}

const decodeName = (name: string) => Buffer.from(name, 'latin1').toString('utf8');

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, MEDIA_DIR),
  filename: (_req, file, cb) => {
    const original = decodeName(file.originalname);
    const ext = path.extname(original).toLowerCase();
    const safeBase = path
      .basename(original, ext)
      .replace(/[^a-zA-Zа-яА-Я0-9-_]+/g, '_')
      .slice(0, 60);
    cb(null, `${Date.now()}-${safeBase}${ext}`);
  },
});

const ALLOWED_EXT = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif'];

const fileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const ext = path.extname(decodeName(file.originalname)).toLowerCase();
  if (ALLOWED_EXT.includes(ext)) cb(null, true);
  else cb(new AppError(`Допустимые форматы изображений: ${ALLOWED_EXT.join(', ')}`, 400));
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 20 * 1024 * 1024 } });

// POST /api/settings/media/upload — загрузить изображение (главный экран, баннер)
mediaUploadsRouter.post('/upload', upload.single('file'), (req: Request, res: Response, next: NextFunction) => {
  try {
    const file = req.file as Express.Multer.File | undefined;
    if (!file) throw new AppError('Файл не загружен', 400);

    const originalName = decodeName(file.originalname);
    const proto = req.headers['x-forwarded-proto'] || req.protocol;
    const baseUrl = `${proto}://${req.get('host')}`;

    res.status(201).json({
      success: true,
      data: {
        url: `${baseUrl}/uploads/media/${file.filename}`,
        size: file.size,
        originalName,
      },
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/settings/media/upload — удалить изображение по URL
mediaUploadsRouter.delete('/upload', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { url } = req.body || {};
    if (!url) throw new AppError('Укажите URL файла', 400);
    const relative = String(url).replace(/^https?:\/\/[^/]+/, '');
    if (!relative.startsWith('/uploads/media/')) {
      return res.json({ success: true, message: 'Внешний URL — файл не удалён' });
    }
    const filePath = path.join(UPLOAD_DIR, relative.replace('/uploads/', ''));
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});
