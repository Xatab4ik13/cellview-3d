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
