import { Context, Markup } from 'telegraf';
import { db } from './database';

const SITE_URL = process.env.SITE_URL || 'https://kladovka78.ru';

/**
 * /start — приветствие + deep link обработка
 */
export async function handleStart(ctx: Context) {
  const startPayload = (ctx as any).startPayload as string | undefined;
  const telegramId = ctx.from?.id;
  const username = ctx.from?.username;
  const firstName = ctx.from?.first_name || 'друг';

  // Check if user is already linked
  const [existing] = await db.query(
    'SELECT id, name FROM customers WHERE telegram_id = ?',
    [String(telegramId)]
  );
  const linkedCustomer = (existing as any[])[0];

  if (startPayload?.startsWith('book_')) {
    // Deep link from booking: book_{cellId}_{duration}
    const parts = startPayload.split('_');
    const cellId = parts[1];
    const duration = parts[2];

    if (linkedCustomer) {
      await ctx.reply(
        `👋 ${linkedCustomer.name}, вы хотите забронировать ячейку.\n\n` +
        `Перейдите на сайт для завершения бронирования:`,
        Markup.inlineKeyboard([
          [Markup.button.url('💳 Перейти к оплате', `${SITE_URL}/checkout`)],
          [Markup.button.url('📦 Каталог ячеек', `${SITE_URL}/catalog`)],
        ])
      );
    } else {
      await ctx.reply(
        `👋 Привет, ${firstName}!\n\n` +
        `Для бронирования нужно привязать ваш аккаунт.\n` +
        `Поделитесь номером телефона:`,
        Markup.keyboard([
          [Markup.button.contactRequest('📱 Отправить номер телефона')],
        ]).resize().oneTime()
      );
    }
    return;
  }

  if (startPayload === 'login') {
    if (linkedCustomer) {
      await ctx.reply(
        `✅ ${linkedCustomer.name}, ваш аккаунт уже привязан!\n\n` +
        `Перейдите в личный кабинет:`,
        Markup.inlineKeyboard([
          [Markup.button.url('🏠 Личный кабинет', `${SITE_URL}/dashboard`)],
        ])
      );
    } else {
      await ctx.reply(
        `👋 Привет, ${firstName}!\n\n` +
        `Для входа в личный кабинет поделитесь номером телефона:`,
        Markup.keyboard([
          [Markup.button.contactRequest('📱 Отправить номер телефона')],
        ]).resize().oneTime()
      );
    }
    return;
  }

  // Default start
  const greeting = linkedCustomer
    ? `👋 Привет, ${linkedCustomer.name}!\n\nВаш аккаунт привязан. Вот что я умею:`
    : `👋 Привет, ${firstName}!\n\nЯ бот склада самообслуживания Кладовка78.\nПривяжите аккаунт, чтобы получать уведомления.`;

  await ctx.reply(
    greeting + '\n\n' +
    '📦 /rentals — Моя аренда\n' +
    '🔑 /login — Привязать аккаунт\n' +
    '❓ /help — Помощь\n' +
    '📞 /contact — Связь с менеджером',
    Markup.inlineKeyboard([
      [Markup.button.url('🌐 Открыть сайт', SITE_URL)],
      [Markup.button.url('📦 Каталог ячеек', `${SITE_URL}/catalog`)],
    ])
  );
}

/**
 * /login — привязка аккаунта
 */
export async function handleLogin(ctx: Context) {
  const telegramId = ctx.from?.id;

  const [existing] = await db.query(
    'SELECT name FROM customers WHERE telegram_id = ?',
    [String(telegramId)]
  );

  if ((existing as any[]).length > 0) {
    await ctx.reply(
      `✅ Ваш аккаунт уже привязан (${(existing as any[])[0].name}).\n\n` +
      `Перейдите в личный кабинет:`,
      Markup.inlineKeyboard([
        [Markup.button.url('🏠 Личный кабинет', `${SITE_URL}/dashboard`)],
      ])
    );
    return;
  }

  await ctx.reply(
    '🔑 Для привязки аккаунта поделитесь номером телефона.\n' +
    'Убедитесь, что этот номер указан в вашем профиле на сайте.',
    Markup.keyboard([
      [Markup.button.contactRequest('📱 Отправить номер телефона')],
    ]).resize().oneTime()
  );
}

/**
 * /rentals — мои аренды
 */
export async function handleMyRentals(ctx: Context) {
  const telegramId = ctx.from?.id;

  try {
    const [customers] = await db.query(
      'SELECT id FROM customers WHERE telegram_id = ?',
      [String(telegramId)]
    );

    if ((customers as any[]).length === 0) {
      await ctx.reply(
        '❌ Аккаунт не привязан. Используйте /login',
      );
      return;
    }

    const customerId = (customers as any[])[0].id;

    const [rentals] = await db.query(`
      SELECT r.*, c.number as cell_number
      FROM rentals r 
      JOIN cells c ON r.cell_id = c.id 
      WHERE r.customer_id = ? AND r.status = 'active'
      ORDER BY r.end_date ASC
    `, [customerId]);

    const rows = rentals as any[];

    if (rows.length === 0) {
      await ctx.reply(
        '📦 У вас нет активных аренд.\n\nВыберите ячейку в каталоге:',
        Markup.inlineKeyboard([
          [Markup.button.url('📦 Каталог', `${SITE_URL}/catalog`)],
        ])
      );
      return;
    }

    let message = '📦 **Ваши активные аренды:**\n\n';
    for (const r of rows) {
      const endDate = new Date(r.end_date).toLocaleDateString('ru-RU');
      const daysLeft = Math.ceil((new Date(r.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      const warning = daysLeft <= 7 ? ' ⚠️' : '';
      message += `🔹 Ячейка №${r.cell_number}${warning}\n`;
      message += `   До: ${endDate} (${daysLeft} дн.)\n`;
      message += `   ${r.monthly_price.toLocaleString('ru-RU')} ₽/мес\n\n`;
    }

    await ctx.reply(message, {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard([
        [Markup.button.url('🏠 Личный кабинет', `${SITE_URL}/dashboard`)],
      ]),
    });
  } catch (err) {
    console.error('Error fetching rentals:', err);
    await ctx.reply('⚠️ Произошла ошибка. Попробуйте позже.');
  }
}

/**
 * /help — помощь
 */
export async function handleHelp(ctx: Context) {
  await ctx.reply(
    '❓ **Помощь**\n\n' +
    '🔑 /login — Привязать аккаунт по номеру телефона\n' +
    '📦 /rentals — Посмотреть активные аренды\n' +
    '📞 /contact — Связаться с менеджером\n\n' +
    '**Как это работает:**\n' +
    '1️⃣ Выберите ячейку на сайте\n' +
    '2️⃣ Нажмите "Забронировать"\n' +
    '3️⃣ Авторизуйтесь через этого бота\n' +
    '4️⃣ Оплатите на сайте\n' +
    '5️⃣ Получайте уведомления здесь!',
    { parse_mode: 'Markdown' }
  );
}

/**
 * /contact — связь с менеджером
 */
export async function handleContact(ctx: Context) {
  await ctx.reply(
    '📞 **Связаться с нами:**\n\n' +
    '☎️ 8 812 123-45-67 (бесплатно по РФ)\n' +
    '📧 info@kladovka78.ru\n' +
    '📍 Санкт-Петербург\n\n' +
    'Или напишите прямо сюда — менеджер ответит!',
    {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard([
        [Markup.button.url('🌐 Контакты на сайте', `${SITE_URL}/contacts`)],
      ]),
    }
  );
}
