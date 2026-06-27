import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { AppError } from '../middleware/errorHandler';

export const documentUploadsRouter = Router();

const UPLOAD_DIR = process.env.UPLOAD_DIR || '/var/www/kladovka78/uploads';
const DOCS_DIR = path.join(UPLOAD_DIR, 'docs');

if (!fs.existsSync(DOCS_DIR)) {
  fs.mkdirSync(DOCS_DIR, { recursive: true });
}

const decodeName = (name: string) => Buffer.from(name, 'latin1').toString('utf8');

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, DOCS_DIR),
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

const ALLOWED_EXT = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.txt', '.rtf', '.odt', '.jpg', '.jpeg', '.png'];

const fileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const ext = path.extname(decodeName(file.originalname)).toLowerCase();
  if (ALLOWED_EXT.includes(ext)) cb(null, true);
  else cb(new AppError(`Допустимые форматы: ${ALLOWED_EXT.join(', ')}`, 400));
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 25 * 1024 * 1024 } });

// POST /api/settings/site-documents/upload — загрузить файл документа
documentUploadsRouter.post('/upload', upload.single('file'), (req: Request, res: Response, next: NextFunction) => {
  try {
    const file = req.file as Express.Multer.File | undefined;
    if (!file) throw new AppError('Файл не загружен', 400);

    // multer декодирует имя файла как latin1 — конвертируем в utf-8, чтобы кириллица отображалась корректно
    const originalName = Buffer.from(file.originalname, 'latin1').toString('utf8');

    const url = `/uploads/docs/${file.filename}`;
    const ext = path.extname(originalName).toLowerCase().replace('.', '').toUpperCase();
    const baseUrl = `${req.protocol}://${req.get('host')}`;

    res.status(201).json({
      success: true,
      data: {
        url: `${baseUrl}${url}`,
        type: ext || 'FILE',
        size: file.size,
        originalName,
      },
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/settings/site-documents/upload — удалить файл по URL
documentUploadsRouter.delete('/upload', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { url } = req.body || {};
    if (!url) throw new AppError('Укажите URL файла', 400);
    const relative = String(url).replace(/^https?:\/\/[^/]+/, '');
    if (!relative.startsWith('/uploads/docs/')) {
      return res.json({ success: true, message: 'Внешний URL — файл не удалён' });
    }
    const filePath = path.join(UPLOAD_DIR, relative.replace('/uploads/', ''));
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});
