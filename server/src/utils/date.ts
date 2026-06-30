// Safe month arithmetic — избегаем JS-багa, когда setMonth на конце месяца
// даёт несуществующую дату (31 июня → 1 июля и т.п.), что ломает запись в MySQL DATE.
export function addMonthsSafe(date: Date | string, months: number): Date {
  const d = new Date(date);
  const day = d.getDate();
  d.setDate(1);
  d.setMonth(d.getMonth() + months);
  const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  d.setDate(Math.min(day, lastDay));
  return d;
}

// Возвращает первое число месяца, смещённого от base на offset месяцев
export function monthStartOffset(base: Date | string, offset: number): Date {
  const d = new Date(base);
  return new Date(d.getFullYear(), d.getMonth() + offset, 1);
}
