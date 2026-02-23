-- Add telegram_id column for bot linking
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'customers' AND COLUMN_NAME = 'telegram_id');
SET @sql = IF(@col_exists = 0, 'ALTER TABLE customers ADD COLUMN telegram_id VARCHAR(50) NULL AFTER telegram', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add index
SET @idx_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'customers' AND INDEX_NAME = 'idx_customers_telegram_id');
SET @sql2 = IF(@idx_exists = 0, 'CREATE INDEX idx_customers_telegram_id ON customers(telegram_id)', 'SELECT 1');
PREPARE stmt2 FROM @sql2;
EXECUTE stmt2;
DEALLOCATE PREPARE stmt2;
