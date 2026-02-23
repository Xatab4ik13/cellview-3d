import { db } from './database';

/**
 * Utility to send notification to a customer via Telegram bot
 * Can be called from the main API or cron jobs
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
 * Notify customer about rental expiring soon
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
      const message =
        `⚠️ *Аренда заканчивается!*\n\n` +
        `Ячейка №${r.cell_number}\n` +
        `Осталось: ${daysLeft} дн.\n\n` +
        `Продлите аренду в личном кабинете.`;

      await sendNotification(r.telegram_id, message, botToken);
    }
  } catch (err) {
    console.error('Error notifying expiring rentals:', err);
  }
}

/**
 * Notify customer about successful payment
 */
export async function notifyPaymentSuccess(
  telegramId: string,
  cellNumber: number,
  amount: number,
  botToken: string
): Promise<void> {
  const message =
    `✅ *Оплата получена!*\n\n` +
    `Ячейка №${cellNumber}\n` +
    `Сумма: ${amount.toLocaleString('ru-RU')} ₽\n\n` +
    `Спасибо за оплату! 🎉`;

  await sendNotification(telegramId, message, botToken);
}
