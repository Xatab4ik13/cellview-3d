import { db } from './database';

/**
 * Send text notification via Telegram
 */
export async function sendNotification(
  telegramId: string,
  message: string,
  botToken: string
): Promise<boolean> {
  try {
    const res = await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: telegramId,
          text: message,
          parse_mode: 'Markdown',
        }),
      }
    );
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Send a document (file) via Telegram
 */
export async function sendDocument(
  telegramId: string,
  fileUrl: string,
  caption: string,
  botToken: string
): Promise<boolean> {
  try {
    const res = await fetch(
      `https://api.telegram.org/bot${botToken}/sendDocument`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: telegramId,
          document: fileUrl,
          caption,
          parse_mode: 'Markdown',
        }),
      }
    );
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Notify customers about rental expiring (7, 3, 1 days)
 */
export async function notifyExpiringRentals(botToken: string): Promise<void> {
  try {
    const [rentals] = await db.query(`
      SELECT r.*, c.number as cell_number, cu.telegram_id, cu.name as customer_name
      FROM rentals r
      JOIN cells c ON r.cell_id = c.id
      JOIN customers cu ON r.customer_id = cu.id
      WHERE r.status = 'active'
        AND cu.telegram_id IS NOT NULL
        AND r.end_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 7 DAY)
    `);

    for (const r of rentals as any[]) {
      const daysLeft = Math.ceil(
        (new Date(r.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );

      if (daysLeft !== 7 && daysLeft !== 3 && daysLeft !== 1) continue;

      const urgency = daysLeft === 1 ? '🔴' : daysLeft === 3 ? '🟠' : '⚠️';
      const message =
        `${urgency} *Аренда заканчивается!*\n\n` +
        `Ячейка №${r.cell_number}\n` +
        `Осталось: ${daysLeft} дн.\n\n` +
        `Оплатите продление в личном кабинете, чтобы сохранить ячейку.\n` +
        `👉 https://kladovka78.ru/dashboard`;

      await sendNotification(r.telegram_id, message, botToken);
    }
  } catch (err) {
    console.error('Error notifying expiring rentals:', err);
  }
}

/**
 * Notify customers about overdue rentals
 */
export async function notifyOverdueRentals(botToken: string): Promise<void> {
  try {
    const [rentals] = await db.query(`
      SELECT r.*, c.number as cell_number, cu.telegram_id, cu.name as customer_name
      FROM rentals r
      JOIN cells c ON r.cell_id = c.id
      JOIN customers cu ON r.customer_id = cu.id
      WHERE r.status = 'active'
        AND cu.telegram_id IS NOT NULL
        AND r.end_date < CURDATE()
    `);

    for (const r of rentals as any[]) {
      const daysOverdue = Math.ceil(
        (Date.now() - new Date(r.end_date).getTime()) / (1000 * 60 * 60 * 24)
      );

      const message =
        `🚨 *Аренда просрочена!*\n\n` +
        `Ячейка №${r.cell_number}\n` +
        `Просрочка: ${daysOverdue} дн.\n\n` +
        `⚠️ Согласно условиям договора, мы имеем право расторгнуть договор в одностороннем порядке.\n\n` +
        `Пожалуйста, оплатите продление как можно скорее:\n` +
        `👉 https://kladovka78.ru/dashboard`;

      await sendNotification(r.telegram_id, message, botToken);
    }
  } catch (err) {
    console.error('Error notifying overdue rentals:', err);
  }
}

/**
 * Notify customer about successful payment + send contract
 */
export async function notifyPaymentSuccess(
  telegramId: string,
  cellNumber: number,
  amount: number,
  botToken: string,
  contractUrl?: string
): Promise<void> {
  const message =
    `✅ *Оплата получена!*\n\n` +
    `Ячейка №${cellNumber}\n` +
    `Сумма: ${amount.toLocaleString('ru-RU')} ₽\n\n` +
    `Спасибо за оплату! 🎉`;

  await sendNotification(telegramId, message, botToken);

  // Send contract PDF if available
  if (contractUrl) {
    await sendDocument(
      telegramId,
      contractUrl,
      `📄 Ваш договор аренды ячейки №${cellNumber}`,
      botToken
    );
  }
}
