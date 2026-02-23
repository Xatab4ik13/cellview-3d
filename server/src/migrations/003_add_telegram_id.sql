-- Add telegram_id column for bot linking
ALTER TABLE customers ADD COLUMN IF NOT EXISTS telegram_id VARCHAR(50) NULL AFTER telegram;
CREATE INDEX IF NOT EXISTS idx_customers_telegram_id ON customers(telegram_id);
