-- Backfill: создаёт платежи (CASH, paid) для прошлых продлений аренды,
-- у которых в revenue_entries нет привязки к payment_id.
-- Группировка по префиксу id revenue_entries вида 'rev-{rentalId}-ext-{ts}'.
-- Идемпотентно: после привязки payment_id записи отфильтровываются.

INSERT IGNORE INTO payments (id, rental_id, customer_id, cell_id, amount, description, duration_months, monthly_price, status, payment_method, paid_at, created_at)
SELECT
  CONCAT('ext-', MD5(LEFT(re.id, LENGTH(re.id) - LENGTH(SUBSTRING_INDEX(re.id, '-', -1)) - 1))) AS pid,
  re.rental_id,
  re.customer_id,
  re.cell_id,
  SUM(re.amount) * 100 AS amount_kopecks,
  CONCAT('Продление аренды на ', COUNT(*), ' мес. (бэкфилл)') AS description,
  COUNT(*) AS months,
  MAX(re.amount) AS monthly_price,
  'paid',
  'CASH',
  MIN(re.created_at),
  MIN(re.created_at)
FROM revenue_entries re
WHERE re.id LIKE 'rev-%-ext-%' AND re.payment_id IS NULL
GROUP BY LEFT(re.id, LENGTH(re.id) - LENGTH(SUBSTRING_INDEX(re.id, '-', -1)) - 1),
         re.rental_id, re.customer_id, re.cell_id;

UPDATE revenue_entries re
SET re.payment_id = CONCAT('ext-', MD5(LEFT(re.id, LENGTH(re.id) - LENGTH(SUBSTRING_INDEX(re.id, '-', -1)) - 1)))
WHERE re.id LIKE 'rev-%-ext-%' AND re.payment_id IS NULL;
