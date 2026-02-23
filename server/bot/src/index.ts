import { Telegraf, Markup } from 'telegraf';
import dotenv from 'dotenv';
import { db } from './database';
import { handleStart, handleLogin, handleMyRentals, handleHelp, handleContact } from './handlers';

dotenv.config();

const BOT_TOKEN = process.env.BOT_TOKEN;
if (!BOT_TOKEN) {
  console.error('❌ BOT_TOKEN not set in .env');
  process.exit(1);
}

const bot = new Telegraf(BOT_TOKEN);

// Commands
bot.start(handleStart);
bot.command('login', handleLogin);
bot.command('rentals', handleMyRentals);
bot.command('help', handleHelp);
bot.command('contact', handleContact);

// Callback queries
bot.action(/^confirm_phone:(.+)$/, async (ctx) => {
  const phone = ctx.match[1];
  const telegramId = ctx.from?.id;
  const username = ctx.from?.username;

  if (!telegramId) return;

  try {
    // Link Telegram to customer by phone
    const [result] = await db.query(
      'UPDATE customers SET telegram = ?, telegram_id = ? WHERE phone = ?',
      [`@${username || telegramId}`, String(telegramId), phone]
    );

    if ((result as any).affectedRows > 0) {
      await ctx.editMessageText(
        '✅ Аккаунт успешно привязан!\n\n' +
        'Теперь вы будете получать уведомления здесь.\n' +
        'Используйте /rentals для просмотра аренды.',
        Markup.inlineKeyboard([
          [Markup.button.url('🏠 Открыть личный кабинет', `${process.env.SITE_URL}/dashboard`)],
        ])
      );
    } else {
      await ctx.editMessageText(
        '❌ Клиент с таким номером не найден.\n' +
        'Убедитесь, что вы зарегистрированы в системе, или обратитесь к менеджеру.',
        Markup.inlineKeyboard([
          [Markup.button.url('📞 Связаться', `${process.env.SITE_URL}/contacts`)],
        ])
      );
    }
  } catch (err) {
    console.error('Error linking account:', err);
    await ctx.editMessageText('⚠️ Произошла ошибка. Попробуйте позже.');
  }
});

// Handle phone sharing via contact
bot.on('contact', async (ctx) => {
  const phone = ctx.message.contact.phone_number;
  const telegramId = ctx.from?.id;
  const username = ctx.from?.username;

  if (!telegramId) return;

  // Normalize phone
  const normalizedPhone = phone.startsWith('+') ? phone : `+${phone}`;

  try {
    // Try to link existing customer
    const [result] = await db.query(
      'UPDATE customers SET telegram = ?, telegram_id = ? WHERE phone LIKE ?',
      [`@${username || telegramId}`, String(telegramId), `%${normalizedPhone.slice(-10)}%`]
    );

    if ((result as any).affectedRows > 0) {
      await ctx.reply(
        '✅ Аккаунт привязан! Добро пожаловать.\n\n' +
        '📦 /rentals — Моя аренда\n' +
        '❓ /help — Помощь\n' +
        '📞 /contact — Связь с менеджером',
        Markup.inlineKeyboard([
          [Markup.button.url('🏠 Личный кабинет', `${process.env.SITE_URL}/dashboard`)],
        ])
      );
    } else {
      // Auto-register new customer
      const firstName = ctx.from?.first_name || '';
      const lastName = ctx.from?.last_name || '';
      const fullName = `${firstName} ${lastName}`.trim() || 'Клиент';

      await db.query(
        'INSERT INTO customers (name, phone, telegram, telegram_id, type, status) VALUES (?, ?, ?, ?, ?, ?)',
        [fullName, normalizedPhone, `@${username || telegramId}`, String(telegramId), 'individual', 'active']
      );

      await ctx.reply(
        '✅ Добро пожаловать! Аккаунт создан.\n\n' +
        `👤 ${fullName}\n` +
        `📱 ${normalizedPhone}\n\n` +
        'Теперь вы можете выбрать и забронировать ячейку:',
        Markup.inlineKeyboard([
          [Markup.button.url('📦 Выбрать ячейку', `${process.env.SITE_URL}/catalog`)],
          [Markup.button.url('🏠 Личный кабинет', `${process.env.SITE_URL}/dashboard`)],
        ])
      );
    }
  } catch (err) {
    console.error('Error processing contact:', err);
    await ctx.reply('⚠️ Произошла ошибка. Попробуйте позже.');
  }
});

// Launch
bot.launch()
  .then(() => console.log('🤖 Kladovka78 Bot is running'))
  .catch((err) => {
    console.error('❌ Bot failed to start:', err);
    process.exit(1);
  });

// Graceful shutdown
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
