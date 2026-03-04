-- Payments table for VTB acquiring
CREATE TABLE IF NOT EXISTS payments (
  id VARCHAR(36) PRIMARY KEY,
  rental_id VARCHAR(36) DEFAULT NULL,
  customer_id VARCHAR(36) NOT NULL,
  cell_id VARCHAR(36) DEFAULT NULL,
  
  -- Order details
  amount INT NOT NULL COMMENT 'Amount in kopecks',
  currency INT DEFAULT 643 COMMENT 'ISO 4217 currency code (643 = RUB)',
  description VARCHAR(512) DEFAULT NULL,
  
  -- VTB gateway fields
  vtb_order_id VARCHAR(64) DEFAULT NULL COMMENT 'orderId from VTB register.do response',
  vtb_form_url VARCHAR(1024) DEFAULT NULL COMMENT 'formUrl for redirect to payment page',
  
  -- Status tracking
  status ENUM('created', 'pending', 'paid', 'failed', 'refunded', 'expired') DEFAULT 'created',
  payment_method VARCHAR(32) DEFAULT NULL COMMENT 'VISA, MASTERCARD, MIR, etc.',
  
  -- Metadata
  return_url VARCHAR(1024) DEFAULT NULL,
  fail_url VARCHAR(1024) DEFAULT NULL,
  client_ip VARCHAR(45) DEFAULT NULL,
  
  -- VTB response data (JSON)
  vtb_response JSON DEFAULT NULL,
  
  paid_at TIMESTAMP NULL DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (rental_id) REFERENCES rentals(id) ON DELETE SET NULL,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
  FOREIGN KEY (cell_id) REFERENCES cells(id) ON DELETE SET NULL
);

CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_vtb_order ON payments(vtb_order_id);
CREATE INDEX idx_payments_customer ON payments(customer_id);
CREATE INDEX idx_payments_rental ON payments(rental_id);
