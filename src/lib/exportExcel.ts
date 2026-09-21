import * as XLSX from 'xlsx';

export function exportRowsToExcel(
  rows: Record<string, string | number>[],
  fileName: string,
  sheetName = 'Лист1',
) {
  const sheet = XLSX.utils.json_to_sheet(rows);
  const headers = rows.length ? Object.keys(rows[0]) : [];
  sheet['!cols'] = headers.map(h => {
    const maxLen = rows.reduce(
      (m, r) => Math.max(m, String(r[h] ?? '').length),
      h.length,
    );
    return { wch: Math.min(Math.max(maxLen + 2, 10), 40) };
  });
  const book = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(book, sheet, sheetName);
  const stamp = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(book, `${fileName}-${stamp}.xlsx`);
}
