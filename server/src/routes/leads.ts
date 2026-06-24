import { Router, Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import pool from '../config/database';
import { sendEmail } from '../config/mailer';

export const leadsRouter = Router();

const ALLOWED_STATUSES = ['new', 'in_progress', 'done', 'cancelled'] as const;
type LeadStatus = typeof ALLOWED_STATUSES[number];

// POST /api/leads/callback — заявка с сайта (публичный)
leadsRouter.post('/callback', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, phone, size, message, source } = req.body || {};

    if (!name || !phone) {
      return res.status(400).json({ success: false, error: 'Имя и телефон обязательны' });
    }

    const safeName = String(name).slice(0, 200);
    const safePhone = String(phone).slice(0, 50);
    const safeSize = size ? String(size).slice(0, 200) : null;
    const safeMessage = message ? String(message).slice(0, 2000) : null;
    const safeSource = source ? String(source).slice(0, 100) : 'Сайт';

    const id = crypto.randomUUID();
    await pool.query(
      `INSERT INTO leads (id, name, phone, size, message, source, status)
       VALUES (?, ?, ?, ?, ?, ?, 'new')`,
      [id, safeName, safePhone, safeSize, safeMessage, safeSource]
    );

    const escape = (s: string) =>
      s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string));

    const html = `
      <h2>Новая заявка с сайта Кладовка78</h2>
      <p><b>Источник:</b> ${escape(safeSource)}</p>
      <p><b>Имя:</b> ${escape(safeName)}</p>
      <p><b>Телефон:</b> <a href="tel:${escape(safePhone)}">${escape(safePhone)}</a></p>
      ${safeSize ? `<p><b>Желаемый размер:</b> ${escape(safeSize)}</p>` : ''}
      ${safeMessage ? `<p><b>Комментарий:</b><br/>${escape(safeMessage).replace(/\n/g, '<br/>')}</p>` : ''}
      <hr/>
      <p style="color:#888;font-size:12px">Время: ${new Date().toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' })} (МСК) · ID: ${id}</p>
    `;

    // Email — не блокируем ответ, если SMTP недоступен
    try {
      await sendEmail(
        process.env.LEADS_TO || 'info@kladovka78.ru',
        `Заявка с сайта: ${safeName} — ${safePhone}`,
        html
      );
    } catch (e) {
      console.error('[leads/callback] email send failed:', e);
    }

    res.json({ success: true, data: { id }, message: 'Заявка отправлена' });
  } catch (error) {
    console.error('[leads/callback] error:', error);
    next(error);
  }
});

// GET /api/leads — список заявок (для CRM)
leadsRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = req.query;
    let sql = 'SELECT id, name, phone, size, message, source, status, notes, created_at AS createdAt, updated_at AS updatedAt FROM leads';
    const params: any[] = [];
    if (status && ALLOWED_STATUSES.includes(String(status) as LeadStatus)) {
      sql += ' WHERE status = ?';
      params.push(status);
    }
    sql += ' ORDER BY created_at DESC LIMIT 500';
    const [rows] = await pool.query(sql, params);
    res.json({ success: true, data: rows });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/leads/:id — обновить статус/заметку
leadsRouter.patch('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body || {};
    const fields: string[] = [];
    const params: any[] = [];
    if (status !== undefined) {
      if (!ALLOWED_STATUSES.includes(status)) {
        return res.status(400).json({ success: false, error: 'Недопустимый статус' });
      }
      fields.push('status = ?');
      params.push(status);
    }
    if (notes !== undefined) {
      fields.push('notes = ?');
      params.push(notes ? String(notes).slice(0, 2000) : null);
    }
    if (!fields.length) {
      return res.status(400).json({ success: false, error: 'Нет полей для обновления' });
    }
    params.push(id);
    await pool.query(`UPDATE leads SET ${fields.join(', ')} WHERE id = ?`, params);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/leads/:id
leadsRouter.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await pool.query('DELETE FROM leads WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});
