import { Router } from 'express';
import { testConnection } from '../config/database';

export const healthRouter = Router();

healthRouter.get('/', async (_req, res) => {
  const dbOk = await testConnection();

  res.status(dbOk ? 200 : 503).json({
    status: dbOk ? 'ok' : 'degraded',
    timestamp: new Date().toISOString(),
    services: {
      api: 'ok',
      database: dbOk ? 'ok' : 'down',
    },
  });
});
