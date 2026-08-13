import { addMonths, format, parseISO, startOfMonth, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";

export function todayISO(timeZone = "America/Sao_Paulo"): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export function formatDateBR(value: string | Date): string {
  const date = typeof value === "string" ? parseISO(value) : value;
  return format(date, "dd/MM/yyyy", { locale: ptBR });
}

export function formatDayMonth(value: string | Date): string {
  const date = typeof value === "string" ? parseISO(value) : value;
  return format(date, "dd MMM", { locale: ptBR }).toUpperCase();
}

export function formatLongDate(value: string | Date): string {
  const date = typeof value === "string" ? parseISO(value) : value;
  return format(date, "d 'de' MMMM", { locale: ptBR });
}

export function monthStartISO(date = new Date()): string {
  return format(startOfMonth(date), "yyyy-MM-dd");
}

export function previousMonthStartISO(date = new Date()): string {
  return format(startOfMonth(subMonths(date, 1)), "yyyy-MM-dd");
}

export function addMonthsISO(dateISO: string, amount: number): string {
  return format(addMonths(parseISO(dateISO), amount), "yyyy-MM-dd");
}

export function rangeForPeriod(
  period: "7d" | "30d" | "3m" | "6m" | "1y",
  timeZone = "America/Sao_Paulo",
): { from: string; to: string } {
  const to = todayISO(timeZone);
  const days =
    period === "7d" ? 6 : period === "30d" ? 29 : period === "3m" ? 89 : period === "6m" ? 179 : 364;
  const fromDate = new Date(`${to}T12:00:00`);
  fromDate.setDate(fromDate.getDate() - days);
  return { from: format(fromDate, "yyyy-MM-dd"), to };
}

export function nextOccurrence(
  fromISO: string,
  frequency: "weekly" | "monthly" | "quarterly" | "semiannual" | "yearly" | "custom",
  intervalCount = 1,
): string {
  const date = parseISO(fromISO);
  switch (frequency) {
    case "weekly":
      date.setDate(date.getDate() + 7 * intervalCount);
      break;
    case "monthly":
      return addMonthsISO(fromISO, intervalCount);
    case "quarterly":
      return addMonthsISO(fromISO, 3 * intervalCount);
    case "semiannual":
      return addMonthsISO(fromISO, 6 * intervalCount);
    case "yearly":
      return addMonthsISO(fromISO, 12 * intervalCount);
    default:
      date.setDate(date.getDate() + intervalCount);
  }
  return format(date, "yyyy-MM-dd");
}
