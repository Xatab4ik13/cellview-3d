-- Точечный ремонт продления, которое не отработало из-за бага с датой:
-- платёж ce04d2c9-... (cell 88, 1000 ₽, 1 мес.) был помечен paid,
-- но end_date/total_amount аренды не обновились и revenue_entries не созданы.
-- Идемпотентно: проверяем, что revenue_entry для этого платежа ещё нет.

INSERT INTO revenue_entries (id, rental_id, customer_id, cell_id, month, amount, payment_id)
SELECT
  CONCAT('rev-', p.rental_id, '-ext-repair-', p.id),
  p.rental_id,
  p.customer_id,
  p.cell_id,
  DATE_FORMAT(r.end_date, '%Y-%m-01'),
  ROUND(p.amount / 100),
  p.id
FROM payments p
JOIN rentals r ON r.id = p.rental_id
WHERE p.id = 'ce04d2c9-8519-4d0c-afc0-2943d2a17260'
  AND NOT EXISTS (SELECT 1 FROM revenue_entries re WHERE re.payment_id = p.id);

UPDATE rentals r
JOIN payments p ON p.rental_id = r.id
SET
  r.end_date = DATE_ADD(r.end_date, INTERVAL p.duration_months MONTH),
  r.duration_months = r.duration_months + p.duration_months,
  r.total_amount = r.total_amount + ROUND(p.amount / 100),
  r.status = 'active',
  r.expiry_notified_at = NULL
WHERE p.id = 'ce04d2c9-8519-4d0c-afc0-2943d2a17260'
  AND r.end_date = '2026-07-02';
