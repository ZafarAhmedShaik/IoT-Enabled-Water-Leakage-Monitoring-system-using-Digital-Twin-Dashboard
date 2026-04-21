/**
 * Triggers a browser download of a UTF-8 CSV built from rows of string cells.
 */
export function downloadCsv(filename: string, rows: string[][]): void {
  const escaped = rows.map((row) =>
    row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','),
  );
  const blob = new Blob([escaped.join('\n')], {
    type: 'text/csv;charset=utf-8',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
