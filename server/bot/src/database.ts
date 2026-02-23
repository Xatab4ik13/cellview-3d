import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

export const db = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'kladovka78',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'kladovka78',
  waitForConnections: true,
  connectionLimit: 5,
});
