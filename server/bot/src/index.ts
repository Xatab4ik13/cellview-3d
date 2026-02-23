import { Telegraf, Markup } from 'telegraf';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { db } from './database';
import { handleStart, handleLogin, handleMyRentals, handleHelp, handleContact, generateAuthToken } from './handlers';

dotenv.config();

const BOT_TOKEN = process.env.BOT_TOKEN;
if (!BOT_TOKEN) {
  console.error('❌ BOT_TOKEN not set in .env');
  process.exit(1);
}

const SITE_URL = process.env.SITE_URL || 'https://kladovka78.ru';

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
    const [result] = await db.query(
      'UPDATE customers SET telegram = ?, telegram_id = ? WHERE phone = ?',
      [`@${username || telegramId}`, String(telegramId), phone]
    );

    if ((result as any).affectedRows > 0) {
      const [customers] = await db.query('SELECT id, name FROM customers WHERE phone = ?', [phone]);
      const customer = (customers as any[])[0];

      if (customer) {
        const authUrl = await generateAuthToken(customer.id);
        await ctx.editMessageText(
          '✅ Аккаунт успешно привязан!\n\n' +
          'Нажмите кнопку ниже для входа в личный кабинет:',
          Markup.inlineKeyboard([
            [Markup.button.url('🏠 Войти в личный кабинет', authUrl)],
          ])
        );
      }
    } else {
      await ctx.editMessageText(
        '❌ Клиент с таким номером не найден.',
        Markup.inlineKeyboard([
          [Markup.button.url('📞 Связаться', `${SITE_URL}/contacts`)],
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

  const normalizedPhone = phone.startsWith('+') ? phone : `+${phone}`;

  try {
    const [result] = await db.query(
      'UPDATE customers SET telegram = ?, telegram_id = ? WHERE phone LIKE ?',
      [`@${username || telegramId}`, String(telegramId), `%${normalizedPhone.slice(-10)}%`]
    );

    if ((result as any).affectedRows > 0) {
      const [customers] = await db.query(
        'SELECT id, name FROM customers WHERE telegram_id = ?',
        [String(telegramId)]
      );
      const customer = (customers as any[])[0];
      const authUrl = customer ? await generateAuthToken(customer.id) : `${SITE_URL}/dashboard`;

      await ctx.reply(
        `✅ Аккаунт привязан! Добро пожаловать, ${customer?.name || ''}.\n\n` +
        'Нажмите кнопку ниже для входа:',
        Markup.inlineKeyboard([
          [Markup.button.url('🏠 Войти в личный кабинет', authUrl)],
          [Markup.button.url('📦 Каталог ячеек', `${SITE_URL}/catalog`)],
        ])
      );
    } else {
      // Auto-register new customer
      const firstName = ctx.from?.first_name || '';
      const lastName = ctx.from?.last_name || '';
      const fullName = `${firstName} ${lastName}`.trim() || 'Клиент';
      const uuid = crypto.randomUUID();

      await db.query(
        'INSERT INTO customers (id, name, phone, telegram, telegram_id, type) VALUES (?, ?, ?, ?, ?, ?)',
        [uuid, fullName, normalizedPhone, `@${username || telegramId}`, String(telegramId), 'individual']
      );

      const authUrl = await generateAuthToken(uuid);

      await ctx.reply(
        `✅ Добро пожаловать, ${fullName}! Аккаунт создан.\n\n` +
        `📱 ${normalizedPhone}\n\n` +
        'Нажмите кнопку ниже для входа в личный кабинет:',
        Markup.inlineKeyboard([
          [Markup.button.url('🏠 Войти в личный кабинет', authUrl)],
          [Markup.button.url('📦 Выбрать ячейку', `${SITE_URL}/catalog`)],
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

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
