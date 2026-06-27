-- Удаляет «синтетические» платежи бэкфилла/реконсиляции (миграции 014 и 015),
-- у которых paid_at попал в будущие месяцы (после текущего).
-- Они засоряли выручку июля и далее.

-- Сначала удаляем привязанные revenue_entries
DELETE re FROM revenue_entries re
JOIN payments p ON p.id = re.payment_id
WHERE (p.id LIKE 'rec-%' OR p.id LIKE 'ext-%')
  AND p.paid_at >= DATE_FORMAT(DATE_ADD(CURDATE(), INTERVAL 1 MONTH), '%Y-%m-01');

-- Затем сами платежи
DELETE FROM payments
WHERE (id LIKE 'rec-%' OR id LIKE 'ext-%')
  AND paid_at >= DATE_FORMAT(DATE_ADD(CURDATE(), INTERVAL 1 MONTH), '%Y-%m-01');
