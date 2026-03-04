-- Fix legacy payments schema to match current VTB integration
-- Each ADD COLUMN is a separate statement for idempotency (ER_DUP_FIELDNAME ignored by runner)

ALTER TABLE payments
  MODIFY COLUMN rental_id VARCHAR(36) NULL;

ALTER TABLE payments
  MODIFY COLUMN amount INT NOT NULL COMMENT 'Amount in kopecks';

ALTER TABLE payments
  MODIFY COLUMN status ENUM('created', 'pending', 'paid', 'completed', 'failed', 'refunded', 'expired') NOT NULL DEFAULT 'pending';

ALTER TABLE payments
  MODIFY COLUMN payment_method VARCHAR(32) NULL COMMENT 'VISA, MASTERCARD, MIR, etc.';

ALTER TABLE payments ADD COLUMN cell_id VARCHAR(36) NULL AFTER customer_id;
ALTER TABLE payments ADD COLUMN currency INT DEFAULT 643 COMMENT 'ISO 4217 currency code (643 = RUB)' AFTER amount;
ALTER TABLE payments ADD COLUMN vtb_order_id VARCHAR(64) DEFAULT NULL COMMENT 'orderId from VTB register.do response' AFTER description;
ALTER TABLE payments ADD COLUMN vtb_form_url VARCHAR(1024) DEFAULT NULL COMMENT 'formUrl for redirect to payment page' AFTER vtb_order_id;
ALTER TABLE payments ADD COLUMN return_url VARCHAR(1024) DEFAULT NULL AFTER status;
ALTER TABLE payments ADD COLUMN fail_url VARCHAR(1024) DEFAULT NULL AFTER return_url;
ALTER TABLE payments ADD COLUMN client_ip VARCHAR(45) DEFAULT NULL AFTER fail_url;
ALTER TABLE payments ADD COLUMN vtb_response JSON DEFAULT NULL AFTER client_ip;
ALTER TABLE payments ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;
