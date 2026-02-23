-- Polling-based auth sessions for seamless Telegram login
CREATE TABLE IF NOT EXISTS auth_sessions (
  id VARCHAR(36) PRIMARY KEY,
  customer_id VARCHAR(36) DEFAULT NULL,
  status ENUM('pending', 'confirmed', 'expired') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NOT NULL,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL
);

CREATE INDEX idx_auth_sessions_status ON auth_sessions(status);
