import { Router, Request, Response, NextFunction } from 'express';
import pool from '../config/database';

export const settingsRouter = Router();

const DEFAULT_DISCOUNTS = { '1': 0, '3': 5, '6': 10, '12': 15 };

// GET /api/settings/discounts
settingsRouter.get('/discounts', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const [rows] = await pool.query(
      `SELECT setting_value FROM site_settings WHERE setting_key = 'discounts' LIMIT 1`
    );
    const row = (rows as any[])[0];
    let discounts = DEFAULT_DISCOUNTS;
    if (row?.setting_value) {
      try { discounts = { ...DEFAULT_DISCOUNTS, ...JSON.parse(row.setting_value) }; } catch {}
    }
    res.json({ success: true, data: discounts });
  } catch (error) {
    next(error);
  }
});

// PUT /api/settings/discounts
settingsRouter.put('/discounts', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = req.body || {};
    const sanitized: Record<string, number> = {};
    for (const k of ['1', '3', '6', '12']) {
      const v = Number(body[k]);
      sanitized[k] = isNaN(v) ? 0 : Math.max(0, Math.min(100, Math.round(v)));
    }
    const json = JSON.stringify(sanitized);
    await pool.query(
      `INSERT INTO site_settings (setting_key, setting_value) VALUES ('discounts', ?)
       ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)`,
      [json]
    );
    res.json({ success: true, data: sanitized });
  } catch (error) {
    next(error);
  }
});

// Универсальный helper для JSON-настроек
async function getJsonSetting<T>(key: string, fallback: T): Promise<T> {
  const [rows] = await pool.query(
    `SELECT setting_value FROM site_settings WHERE setting_key = ? LIMIT 1`,
    [key]
  );
  const row = (rows as any[])[0];
  if (!row?.setting_value) return fallback;
  try { return JSON.parse(row.setting_value) as T; } catch { return fallback; }
}

async function putJsonSetting(key: string, value: unknown): Promise<void> {
  await pool.query(
    `INSERT INTO site_settings (setting_key, setting_value) VALUES (?, ?)
     ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)`,
    [key, JSON.stringify(value)]
  );
}

const DEFAULT_SITE = {
  seoTitle: 'Кладовка78 — Аренда складских ячеек в Санкт-Петербурге',
  seoDescription: 'Надёжное хранение вещей от 1000₽/мес. Видеонаблюдение 24/7. Удобный доступ.',
  seoKeywords: 'склад, аренда ячейки, хранение вещей, Санкт-Петербург',
  heroTitle: 'Надёжное хранение вещей',
  heroSubtitle: 'Арендуйте складскую ячейку от 1000₽ в месяц с круглосуточным доступом',
  phone: '8 (911) 810-83-83',
  email: 'info@kladovka78.ru',
  address: 'Санкт-Петербург, ул. Алтайская, 21',
  workHours: 'Пн-Вс: 08:00 — 22:00',
  telegram: '',
  whatsapp: '',
  vk: '',
  showPricing: true,
  showFAQ: true,
  showCatalog: true,
  showContacts: true,
};

// GET /api/settings/site
settingsRouter.get('/site', async (_req, res, next) => {
  try {
    const data = await getJsonSetting('site', {});
    res.json({ success: true, data: { ...DEFAULT_SITE, ...(data as object) } });
  } catch (error) { next(error); }
});

// PUT /api/settings/site
settingsRouter.put('/site', async (req, res, next) => {
  try {
    const body = req.body || {};
    const sanitized: Record<string, any> = { ...DEFAULT_SITE };
    for (const k of Object.keys(DEFAULT_SITE)) {
      if (k in body) sanitized[k] = body[k];
    }
    await putJsonSetting('site', sanitized);
    res.json({ success: true, data: sanitized });
  } catch (error) { next(error); }
});

// GET /api/settings/site-documents
settingsRouter.get('/site-documents', async (_req, res, next) => {
  try {
    const data = await getJsonSetting<any[]>('site_documents', []);
    res.json({ success: true, data: Array.isArray(data) ? data : [] });
  } catch (error) { next(error); }
});

// PUT /api/settings/site-documents
settingsRouter.put('/site-documents', async (req, res, next) => {
  try {
    const arr = Array.isArray(req.body) ? req.body : (req.body?.documents || []);
    await putJsonSetting('site_documents', arr);
    res.json({ success: true, data: arr });
  } catch (error) { next(error); }
});
