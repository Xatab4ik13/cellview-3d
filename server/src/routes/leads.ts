import { Router, Request, Response, NextFunction } from 'express';
import { sendEmail } from '../config/mailer';

export const leadsRouter = Router();

// POST /api/leads/callback — заявка на обратный звонок с сайта
leadsRouter.post('/callback', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, phone, size, message, source } = req.body || {};

    if (!name || !phone) {
      return res.status(400).json({ success: false, error: 'Имя и телефон обязательны' });
    }

    const safeName = String(name).slice(0, 200);
    const safePhone = String(phone).slice(0, 50);
    const safeSize = size ? String(size).slice(0, 200) : '';
    const safeMessage = message ? String(message).slice(0, 2000) : '';
    const safeSource = source ? String(source).slice(0, 100) : 'Сайт';

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
      <p style="color:#888;font-size:12px">Время: ${new Date().toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' })} (МСК)</p>
    `;

    await sendEmail(
      process.env.LEADS_TO || 'info@kladovka78.ru',
      `Заявка с сайта: ${safeName} — ${safePhone}`,
      html
    );

    res.json({ success: true, message: 'Заявка отправлена' });
  } catch (error) {
    console.error('[leads/callback] error:', error);
    next(error);
  }
});
