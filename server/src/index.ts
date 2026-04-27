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

// Error handling
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Kladovka78 API running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;
