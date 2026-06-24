-- Backfill: восстанавливает старые продления, где аренду продлили,
-- но отдельные платежи за продление не были созданы.
-- Идемпотентно: считает уже оплаченные месяцы по payments.duration_months
-- и создаёт только недостающие месячные CASH-платежи.

UPDATE payments p
JOIN (
  SELECT
    re.payment_id,
    MIN(re.month) AS first_month,
    COUNT(*) AS months,
    SUM(re.amount) AS total_amount,
    MAX(re.amount) AS monthly_price
  FROM revenue_entries re
  WHERE re.payment_id IS NOT NULL
    AND re.id LIKE 'rev-%-ext-%'
  GROUP BY re.payment_id
) x ON x.payment_id = p.id
SET
  p.paid_at = x.first_month,
  p.created_at = x.first_month,
  p.duration_months = x.months,
  p.monthly_price = x.monthly_price,
  p.amount = x.total_amount * 100
WHERE p.id LIKE 'ext-%'
  AND p.status = 'paid';

INSERT IGNORE INTO payments (id, rental_id, customer_id, cell_id, amount, description, duration_months, monthly_price, status, payment_method, paid_at, created_at)
SELECT
  CONCAT('rec-', MD5(CONCAT(base.rental_id, ':', seq.n))) AS id,
  base.rental_id,
  base.customer_id,
  base.cell_id,
  base.monthly_price * 100 AS amount,
  'Продление аренды на 1 мес. (восстановлено)' AS description,
  1 AS duration_months,
  base.monthly_price,
  'paid' AS status,
  'CASH' AS payment_method,
  DATE_ADD(base.start_date, INTERVAL (base.paid_months + seq.n - 1) MONTH) AS paid_at,
  DATE_ADD(base.start_date, INTERVAL (base.paid_months + seq.n - 1) MONTH) AS created_at
FROM (
  SELECT
    r.id AS rental_id,
    r.customer_id,
    r.cell_id,
    r.start_date,
    r.duration_months,
    r.monthly_price,
    paid.paid_months
  FROM rentals r
  JOIN (
    SELECT
      rental_id,
      SUM(COALESCE(NULLIF(duration_months, 0), 1)) AS paid_months
    FROM payments
    WHERE status = 'paid'
      AND rental_id IS NOT NULL
    GROUP BY rental_id
  ) paid ON paid.rental_id = r.id
  WHERE r.duration_months > paid.paid_months
    AND r.monthly_price > 0
) base
JOIN (
  SELECT ones.n + tens.n * 10 + 1 AS n
  FROM (
    SELECT 0 AS n UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4
    UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9
  ) ones
  CROSS JOIN (
    SELECT 0 AS n UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4
    UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9
  ) tens
) seq ON seq.n <= (base.duration_months - base.paid_months);