-- Исправление: у части платежей monthly_price был записан в копейках (в 100 раз больше).
-- Из-за этого revenue_entries получили завышенные суммы (например 170 000 ₽ вместо 1 700 ₽).
-- Идемпотентно: правится только там, где monthly_price явно не согласуется с amount.

UPDATE payments
SET monthly_price = ROUND(amount / 100 / GREATEST(1, COALESCE(NULLIF(duration_months, 0), 1)))
WHERE amount > 0
  AND monthly_price > (amount / 100) * 1.5
  AND monthly_price >= (amount / GREATEST(1, COALESCE(NULLIF(duration_months, 0), 1))) * 0.9;

UPDATE revenue_entries re
JOIN payments p ON p.id = re.payment_id
SET re.amount = ROUND(p.amount / 100 / GREATEST(1, COALESCE(NULLIF(p.duration_months, 0), 1)))
WHERE p.amount > 0
  AND re.amount > (p.amount / 100) * 1.5;
