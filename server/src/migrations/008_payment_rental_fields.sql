ALTER TABLE payments ADD COLUMN duration_months INT NULL AFTER description;
ALTER TABLE payments ADD COLUMN monthly_price INT NULL AFTER duration_months;
