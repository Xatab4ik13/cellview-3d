-- Удаляет фейковые «восстановленные» платежи (миграция 015),
-- у которых paid_at попал в будущие месяцы (после текущего).
-- Эти строки засоряли выручку июля/августа и далее.

-- Сначала удаляем привязанные revenue_entries (если были созданы)
DELETE re FROM revenue_entries re
JOIN payments p ON p.id = re.payment_id
WHERE p.id LIKE 'rec-%'
  AND p.paid_at >= DATE_FORMAT(DATE_ADD(CURDATE(), INTERVAL 1 MONTH), '%Y-%m-01');

-- Затем сами платежи
DELETE FROM payments
WHERE id LIKE 'rec-%'
  AND paid_at >= DATE_FORMAT(DATE_ADD(CURDATE(), INTERVAL 1 MONTH), '%Y-%m-01');
