-- Add 'completed' status to rentals (manual completion)
ALTER TABLE rentals MODIFY COLUMN status ENUM('active', 'expired', 'cancelled', 'completed') NOT NULL DEFAULT 'active';
