import { Context, Markup } from 'telegraf';
import { db } from './database';

const SITE_URL = process.env.SITE_URL || 'https://kladovka78.ru';
const API_URL = process.env.API_URL || 'https://api.kladovka78.ru';

/**
 * Confirm a polling auth session via API
 */
async function confirmAuthSession(sessionId: string, customerId: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_URL}/api/auth/session/${sessionId}/confirm`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customerId }),
    });
    const json = await res.json();
    return json.success === true;
  } catch (err) {
    console.error('Failed to confirm auth session:', err);
    return false;
  }
}

/**
 * /start — приветствие + deep link обработка
 */
export async function handleStart(ctx: Context) {
  const startPayload = (ctx as any).startPayload as string | undefined;
  const telegramId = ctx.from?.id;
  const firstName = ctx.from?.first_name || 'друг';

  // Check if user is already linked
  const [existing] = await db.query(
    'SELECT id, name FROM customers WHERE telegram_id = ?',
    [String(telegramId)]
  );
  const linkedCustomer = (existing as any[])[0];

  // Handle seamless polling auth: login_<sessionId>
  if (startPayload?.startsWith('login_')) {
    const sessionId = startPayload.replace('login_', '');

    if (linkedCustomer) {
      // Confirm the session via API — site will auto-detect
      const confirmed = await confirmAuthSession(sessionId, linkedCustomer.id);
      if (confirmed) {
        await ctx.reply(
          `✅ ${linkedCustomer.name}, вход выполнен!\n\n` +
          `Вернитесь на сайт — он автоматически откроет личный кабинет.`,
          Markup.inlineKeyboard([
            [Markup.button.url('🏠 Открыть сайт', SITE_URL)],
          ])
        );
      } else {
        await ctx.reply('⚠️ Сессия истекла. Попробуйте ещё раз на сайте.');
      }
    } else {
      // New user — ask for phone, save sessionId for after registration
      (ctx as any).session = { pendingSessionId: sessionId };
      await ctx.reply(
        `👋 Привет, ${firstName}!\n\n` +
        `Для входа поделитесь номером телефона:`,
        Markup.keyboard([
          [Markup.button.contactRequest('📱 Отправить номер телефона')],
        ]).resize().oneTime()
      );
    }
    return;
  }

  // Handle booking deep link: book_<cellId>_<duration>
  if (startPayload?.startsWith('book_')) {
    if (linkedCustomer) {
      await ctx.reply(
        `👋 ${linkedCustomer.name}, вы хотите забронировать ячейку.\n\n` +
        `Вернитесь на сайт для завершения бронирования.`,
        Markup.inlineKeyboard([
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

  // Default /start or /start login
  if (linkedCustomer) {
    await ctx.reply(
      `✅ ${linkedCustomer.name}, ваш аккаунт привязан!\n\n` +
      `Для входа в личный кабинет используйте кнопку «Войти» на сайте.`,
      Markup.inlineKeyboard([
        [Markup.button.url('🏠 Открыть сайт', SITE_URL)],
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
}

/**
 * /login — привязка аккаунта
 */
export async function handleLogin(ctx: Context) {
  const telegramId = ctx.from?.id;

  const [existing] = await db.query(
    'SELECT id, name FROM customers WHERE telegram_id = ?',
    [String(telegramId)]
  );

  if ((existing as any[]).length > 0) {
    const customer = (existing as any[])[0];
    await ctx.reply(
      `✅ Ваш аккаунт уже привязан (${customer.name}).\n\n` +
      `Используйте кнопку «Войти» на сайте для входа в ЛК.`,
      Markup.inlineKeyboard([
        [Markup.button.url('🏠 Открыть сайт', SITE_URL)],
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
      await ctx.reply('❌ Аккаунт не привязан. Используйте /login');
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
        [Markup.button.url('🏠 Открыть сайт', SITE_URL)],
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
    '1️⃣ Нажмите «Войти» на сайте\n' +
    '2️⃣ Нажмите «Старт» в этом боте\n' +
    '3️⃣ Сайт автоматически откроет ваш ЛК!',
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
