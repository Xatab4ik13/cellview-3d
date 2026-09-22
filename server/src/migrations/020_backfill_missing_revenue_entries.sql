-- Восстановление помесячной разбивки выручки для оплаченных платежей,
-- у которых revenue_entries не были созданы (платёж привязался к уже
-- существующей аренде — в этой ветке кода разбивка не формировалась).
-- Идемпотентно: берём только аренды, у которых нет ни одной записи выручки.

INSERT INTO revenue_entries (id, rental_id, customer_id, cell_id, month, amount, payment_id)
SELECT
  CONCAT('rev-bf-', MD5(CONCAT(p.id, '-', n.i))),
  p.rental_id,
  p.customer_id,
  p.cell_id,
  DATE_FORMAT(DATE_ADD(r.start_date, INTERVAL n.i MONTH), '%Y-%m-01'),
  CASE
    WHEN n.i = 0 THEN ROUND(p.amount / 100)
      - FLOOR(ROUND(p.amount / 100) / GREATEST(COALESCE(p.duration_months, 1), 1))
        * (GREATEST(COALESCE(p.duration_months, 1), 1) - 1)
    ELSE FLOOR(ROUND(p.amount / 100) / GREATEST(COALESCE(p.duration_months, 1), 1))
  END,
  p.id
FROM payments p
JOIN rentals r ON r.id = p.rental_id
JOIN (
  SELECT 0 AS i UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3
  UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7
  UNION ALL SELECT 8 UNION ALL SELECT 9 UNION ALL SELECT 10 UNION ALL SELECT 11
  UNION ALL SELECT 12 UNION ALL SELECT 13 UNION ALL SELECT 14 UNION ALL SELECT 15
  UNION ALL SELECT 16 UNION ALL SELECT 17 UNION ALL SELECT 18 UNION ALL SELECT 19
  UNION ALL SELECT 20 UNION ALL SELECT 21 UNION ALL SELECT 22 UNION ALL SELECT 23
) n ON n.i < GREATEST(COALESCE(p.duration_months, 1), 1)
WHERE p.status = 'paid'
  AND p.rental_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM revenue_entries re WHERE re.rental_id = p.rental_id);
