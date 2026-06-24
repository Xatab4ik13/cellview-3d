import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { errorHandler } from './middleware/errorHandler';
import { healthRouter } from './routes/health';
import { cellsRouter } from './routes/cells';
import { customersRouter } from './routes/customers';
import { rentalsRouter } from './routes/rentals';
import { photosRouter } from './routes/photos';
import { authRouter } from './routes/auth';
import { paymentsRouter } from './routes/payments';
import { revenueRouter } from './routes/revenue';
import { leadsRouter } from './routes/leads';
import { settingsRouter } from './routes/settings';
import { documentUploadsRouter } from './routes/documentUploads';
import pool from './config/database';
import { notifyAdminRentalExpiring } from './config/adminNotify';


// Для sandbox ВТБ: их тестовый сервер использует сертификат, не входящий в стандартные CA
if (process.env.NODE_TLS_REJECT_UNAUTHORIZED === '0') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

const app = express();
const PORT = process.env.PORT || 3001;

// Security & parsing
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  crossOriginOpenerPolicy: { policy: 'unsafe-none' },
}));
app.use(cors({
  origin: (process.env.CORS_ORIGIN || 'https://kladovka78.ru').split(',').map(s => s.trim()),
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined'));

// Static files for uploads
app.use('/uploads', express.static(process.env.UPLOAD_DIR || '/var/www/kladovka78/uploads'));

// Routes
app.use('/api/health', healthRouter);
app.use('/api/cells', cellsRouter);
app.use('/api/cells', photosRouter);
app.use('/api/customers', customersRouter);
app.use('/api/rentals', rentalsRouter);
app.use('/api/auth', authRouter);
app.use('/api/payments', paymentsRouter);
app.use('/api/revenue', revenueRouter);
app.use('/api/leads', leadsRouter);
app.use('/api/settings/site-documents', documentUploadsRouter);
app.use('/api/settings', settingsRouter);

// Error handling
app.use(errorHandler);

// ===== Авто-очистка просроченных платежей (старше 24 часов в статусах created/pending) =====
async function cleanupStalePayments() {
  try {
    const [result] = await pool.query(
      `DELETE FROM payments
       WHERE status IN ('created', 'pending')
         AND created_at < NOW() - INTERVAL 24 HOUR`
    );
    const affected = (result as any).affectedRows || 0;
    if (affected > 0) {
      console.log(`[cleanup] удалено ${affected} просроченных неоплаченных платежей`);
    }
  } catch (err) {
    console.error('[cleanup] ошибка авто-очистки платежей:', err);
  }
}
// Запуск каждый час + один раз сразу при старте
setInterval(cleanupStalePayments, 60 * 60 * 1000);
setTimeout(cleanupStalePayments, 30 * 1000);

// ===== Уведомления админу за 7 дней до окончания аренды =====
const EXPIRY_NOTIFY_DAYS = Number(process.env.RENTAL_EXPIRY_NOTIFY_DAYS || 7);

async function notifyExpiringRentals() {
  try {
    const [rows] = await pool.query(
      `SELECT r.id, r.cell_id, r.customer_id, r.end_date,
              DATEDIFF(r.end_date, CURDATE()) AS days_left,
              c.number AS cell_number,
              cu.name AS customer_name, cu.phone AS customer_phone
       FROM rentals r
       LEFT JOIN cells c ON c.id = r.cell_id
       LEFT JOIN customers cu ON cu.id = r.customer_id
       WHERE r.status = 'active'
         AND r.expiry_notified_at IS NULL
         AND r.end_date IS NOT NULL
         AND r.end_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL ? DAY)`,
      [EXPIRY_NOTIFY_DAYS]
    );
    const list = rows as any[];
    if (!list.length) return;
    console.log(`[expiry-notify] ${list.length} аренд истекают в ближайшие ${EXPIRY_NOTIFY_DAYS} дн.`);
    for (const r of list) {
      try {
        const endDateStr = new Date(r.end_date).toLocaleDateString('ru-RU');
        await notifyAdminRentalExpiring({
          customerName: r.customer_name,
          customerPhone: r.customer_phone,
          cellNumber: r.cell_number,
          endDate: endDateStr,
          daysLeft: Number(r.days_left) || 0,
          rentalId: r.id,
        });
        await pool.query('UPDATE rentals SET expiry_notified_at = NOW() WHERE id = ?', [r.id]);
      } catch (err) {
        console.error('[expiry-notify] не удалось уведомить по аренде', r.id, err);
      }
    }
  } catch (err) {
    console.error('[expiry-notify] ошибка проверки:', err);
  }
}
// Запуск раз в сутки + один раз через минуту после старта
setInterval(notifyExpiringRentals, 24 * 60 * 60 * 1000);
setTimeout(notifyExpiringRentals, 60 * 1000);

app.listen(PORT, () => {
  console.log(`🚀 Kladovka78 API running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;
