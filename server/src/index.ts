import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/errorHandler';
import { healthRouter } from './routes/health';
import { cellsRouter } from './routes/cells';
import { customersRouter } from './routes/customers';
import { rentalsRouter } from './routes/rentals';

dotenv.config();

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
app.use('/api/customers', customersRouter);
app.use('/api/rentals', rentalsRouter);
// Error handling
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Kladovka78 API running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;
