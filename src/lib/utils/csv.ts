// Minimal CSV export helpers. Handles commas, quotes, and newlines inside fields
// per RFC 4180. Values go through String(); Date is ISO-formatted for portability.

function escapeCsvValue(value: unknown): string {
  if (value === null || value === undefined) return '';
  const str = value instanceof Date ? value.toISOString() : String(value);
  const needsQuoting = /[",\n\r]/.test(str);
  if (!needsQuoting) return str;
  return `"${str.replace(/"/g, '""')}"`;
}

export function toCsv<T extends Record<string, unknown>>(rows: T[], columns?: (keyof T)[]): string {
  if (rows.length === 0) {
    return columns ? (columns as string[]).join(',') + '\n' : '';
  }
  const headers = (columns as string[] | undefined) ?? Object.keys(rows[0]);
  const lines: string[] = [headers.map(escapeCsvValue).join(',')];
  for (const row of rows) {
    lines.push(headers.map(h => escapeCsvValue((row as any)[h])).join(','));
  }
  return lines.join('\n') + '\n';
}

export function downloadCsv(filename: string, csvContent: string): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportAsCsv<T extends Record<string, unknown>>(
  filename: string,
  rows: T[],
  columns?: (keyof T)[]
): void {
  downloadCsv(filename, toCsv(rows, columns));
}
