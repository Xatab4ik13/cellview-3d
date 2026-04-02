CREATE TABLE IF NOT EXISTS revenue_entries (
  id VARCHAR(64) PRIMARY KEY,
  rental_id VARCHAR(36) NOT NULL,
  customer_id VARCHAR(36) NOT NULL,
  cell_id VARCHAR(36) NOT NULL,
  month DATE NOT NULL,
  amount INT NOT NULL,
  payment_id VARCHAR(36) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_revenue_month (month),
  INDEX idx_revenue_rental (rental_id),
  INDEX idx_revenue_customer (customer_id)
);
