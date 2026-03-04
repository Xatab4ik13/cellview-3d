-- Fix legacy payments schema to match current VTB integration
-- Safe for repeated runs

ALTER TABLE payments
  MODIFY COLUMN rental_id VARCHAR(36) NULL;

ALTER TABLE payments
  MODIFY COLUMN amount INT NOT NULL COMMENT 'Amount in kopecks';

ALTER TABLE payments
  MODIFY COLUMN status ENUM('created', 'pending', 'paid', 'completed', 'failed', 'refunded', 'expired') NOT NULL DEFAULT 'pending';

ALTER TABLE payments
  MODIFY COLUMN payment_method VARCHAR(32) NULL COMMENT 'VISA, MASTERCARD, MIR, etc.';

ALTER TABLE payments
  ADD COLUMN IF NOT EXISTS cell_id VARCHAR(36) NULL AFTER customer_id,
  ADD COLUMN IF NOT EXISTS currency INT DEFAULT 643 COMMENT 'ISO 4217 currency code (643 = RUB)' AFTER amount,
  ADD COLUMN IF NOT EXISTS vtb_order_id VARCHAR(64) DEFAULT NULL COMMENT 'orderId from VTB register.do response' AFTER description,
  ADD COLUMN IF NOT EXISTS vtb_form_url VARCHAR(1024) DEFAULT NULL COMMENT 'formUrl for redirect to payment page' AFTER vtb_order_id,
  ADD COLUMN IF NOT EXISTS return_url VARCHAR(1024) DEFAULT NULL AFTER status,
  ADD COLUMN IF NOT EXISTS fail_url VARCHAR(1024) DEFAULT NULL AFTER return_url,
  ADD COLUMN IF NOT EXISTS client_ip VARCHAR(45) DEFAULT NULL AFTER fail_url,
  ADD COLUMN IF NOT EXISTS vtb_response JSON DEFAULT NULL AFTER client_ip,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;
