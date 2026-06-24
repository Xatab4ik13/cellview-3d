import { sendEmail } from './mailer';

const ADMIN_EMAIL = process.env.ADMIN_NOTIFY_EMAIL || '89118108383@mail.ru';

function escapeHtml(s: unknown): string {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c] as string));
}

function nowMsk(): string {
  return new Date().toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' }) + ' (МСК)';
}

type Row = { label: string; value: string | number | null | undefined };

function renderTemplate(opts: {
  title: string;
  intro?: string;
  accent?: string; // header bar color
  rows: Row[];
  footer?: string;
}): string {
  const accent = opts.accent || '#f97316';
  const rowsHtml = opts.rows
    .filter((r) => r.value !== null && r.value !== undefined && String(r.value).length > 0)
    .map(
      (r) => `
        <tr>
          <td style="padding:8px 12px;color:#666;font-size:13px;border-bottom:1px solid #eee;width:40%;">${escapeHtml(r.label)}</td>
          <td style="padding:8px 12px;color:#111;font-size:14px;border-bottom:1px solid #eee;"><b>${escapeHtml(r.value)}</b></td>
        </tr>`,
    )
    .join('');

  return `
  <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; background:#fff; border:1px solid #eee; border-radius:12px; overflow:hidden;">
    <div style="background:${accent}; padding:18px 24px;">
      <div style="color:#fff;font-size:13px;letter-spacing:1px;text-transform:uppercase;opacity:0.9;">Кладовка78 · Уведомление</div>
      <div style="color:#fff;font-size:20px;font-weight:bold;margin-top:4px;">${escapeHtml(opts.title)}</div>
    </div>
    <div style="padding:20px 24px;">
      ${opts.intro ? `<p style="color:#444;line-height:1.5;margin:0 0 16px;">${escapeHtml(opts.intro)}</p>` : ''}
      <table style="width:100%;border-collapse:collapse;">${rowsHtml}</table>
      ${opts.footer ? `<p style="color:#888;font-size:12px;margin-top:18px;">${escapeHtml(opts.footer)}</p>` : ''}
      <p style="color:#aaa;font-size:11px;margin-top:14px;">${nowMsk()}</p>
    </div>
  </div>`;
}

export async function notifyAdmin(subject: string, html: string): Promise<void> {
  try {
    await sendEmail(ADMIN_EMAIL, subject, html);
  } catch (err) {
    console.error('[adminNotify] email send failed:', err);
  }
}

// ---------- Specific notifications ----------

export async function notifyAdminPayment(opts: {
  customerName?: string | null;
  customerPhone?: string | null;
  cellNumber?: string | number | null;
  amountRubles: number;
  durationMonths?: number | null;
  method: string; // CASH / VTB / ...
  paymentId: string;
  kind?: 'new' | 'extension';
}): Promise<void> {
  const kindLabel = opts.kind === 'extension' ? 'Продление аренды' : 'Новая оплата';
  const subject = `${kindLabel}: ячейка №${opts.cellNumber ?? '—'} — ${opts.amountRubles.toLocaleString('ru-RU')} ₽`;
  const html = renderTemplate({
    title: `${kindLabel} · ${opts.amountRubles.toLocaleString('ru-RU')} ₽`,
    intro: 'На сайте Кладовка78 поступила оплата.',
    accent: '#16a34a',
    rows: [
      { label: 'Клиент', value: opts.customerName || '—' },
      { label: 'Телефон', value: opts.customerPhone || '—' },
      { label: 'Ячейка №', value: opts.cellNumber ?? '—' },
      { label: 'Сумма', value: `${opts.amountRubles.toLocaleString('ru-RU')} ₽` },
      { label: 'Срок', value: opts.durationMonths ? `${opts.durationMonths} мес.` : null },
      { label: 'Способ оплаты', value: opts.method },
      { label: 'ID платежа', value: opts.paymentId },
    ],
  });
  await notifyAdmin(subject, html);
}

export async function notifyAdminRentalExpiring(opts: {
  customerName?: string | null;
  customerPhone?: string | null;
  cellNumber?: string | number | null;
  endDate: string;
  daysLeft: number;
  rentalId: string;
}): Promise<void> {
  const subject = `Скоро окончание аренды (через ${opts.daysLeft} дн.): ячейка №${opts.cellNumber ?? '—'}`;
  const html = renderTemplate({
    title: `Аренда заканчивается через ${opts.daysLeft} дн.`,
    intro: 'Свяжитесь с клиентом для продления аренды.',
    accent: '#f59e0b',
    rows: [
      { label: 'Клиент', value: opts.customerName || '—' },
      { label: 'Телефон', value: opts.customerPhone || '—' },
      { label: 'Ячейка №', value: opts.cellNumber ?? '—' },
      { label: 'Дата окончания', value: opts.endDate },
      { label: 'ID аренды', value: opts.rentalId },
    ],
  });
  await notifyAdmin(subject, html);
}

export { renderTemplate };
