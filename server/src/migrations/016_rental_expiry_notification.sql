-- Track when admin was notified about upcoming rental expiry to avoid duplicate emails
ALTER TABLE rentals
  ADD COLUMN expiry_notified_at DATETIME NULL AFTER end_date;

CREATE INDEX idx_rentals_expiry_notify ON rentals (status, end_date, expiry_notified_at);
