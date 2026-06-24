-- Backfill: создаёт платежи (CASH, paid) для прошлых продлений аренды,
-- у которых в revenue_entries нет привязки к payment_id.
-- Группировка по префиксу id revenue_entries вида 'rev-{rentalId}-ext-{ts}'.
-- Идемпотентно: после привязки payment_id записи отфильтровываются.

INSERT IGNORE INTO payments (id, rental_id, customer_id, cell_id, amount, description, duration_months, monthly_price, status, payment_method, paid_at, created_at)
SELECT
  CONCAT('ext-', MD5(t.group_key)) AS pid,
  t.rental_id,
  t.customer_id,
  t.cell_id,
  SUM(t.amount) * 100 AS amount_kopecks,
  CONCAT('Продление аренды на ', COUNT(*), ' мес. (бэкфилл)') AS description,
  COUNT(*) AS months,
  MAX(t.amount) AS monthly_price,
  'paid',
  'CASH',
  MIN(t.month),
  MIN(t.month)
FROM (
  SELECT
    re.id,
    re.rental_id,
    re.customer_id,
    re.cell_id,
    re.month,
    re.amount,
    re.created_at,
    LEFT(re.id, LENGTH(re.id) - LENGTH(SUBSTRING_INDEX(re.id, '-', -1)) - 1) AS group_key
  FROM revenue_entries re
  WHERE re.id LIKE 'rev-%-ext-%' AND re.payment_id IS NULL
) t
GROUP BY t.group_key, t.rental_id, t.customer_id, t.cell_id;

UPDATE revenue_entries re
SET re.payment_id = CONCAT('ext-', MD5(LEFT(re.id, LENGTH(re.id) - LENGTH(SUBSTRING_INDEX(re.id, '-', -1)) - 1)))
WHERE re.id LIKE 'rev-%-ext-%' AND re.payment_id IS NULL;
