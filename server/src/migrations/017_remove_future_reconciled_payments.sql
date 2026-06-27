-- Удаляет фейковые «восстановленные» платежи (миграция 015),
-- у которых paid_at попал в будущее (текущий месяц и далее).
-- Эти строки засоряли выручку июля/августа и т.д.

-- Сначала удаляем привязанные revenue_entries (если были созданы)
DELETE re FROM revenue_entries re
JOIN payments p ON p.id = re.payment_id
WHERE p.id LIKE 'rec-%'
  AND p.paid_at >= DATE_FORMAT(CURDATE(), '%Y-%m-01');

-- Затем сами платежи
DELETE FROM payments
WHERE id LIKE 'rec-%'
  AND paid_at >= DATE_FORMAT(CURDATE(), '%Y-%m-01');
