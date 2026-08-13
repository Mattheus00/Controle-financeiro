export function toCsv(rows: Array<Record<string, unknown>>): string {
  if (rows.length === 0) return "";
  const headers = Object.keys(rows[0]!);
  const escape = (value: unknown) => {
    if (value == null) return "";
    const text = Array.isArray(value) ? value.join(";") : String(value);
    if (/[",\n\r]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
    return text;
  };
  return [
    headers.join(","),
    ...rows.map((row) => headers.map((header) => escape(row[header])).join(",")),
  ].join("\n");
}

export function toJsonFile(value: unknown) {
  return `${JSON.stringify(value, null, 2)}\n`;
}
