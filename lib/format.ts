import {
  eachDayOfInterval,
  endOfMonth,
  format,
  isValid,
  parseISO,
  startOfMonth,
  subMonths,
} from "date-fns";
import { id as idLocale } from "date-fns/locale";

/** Format a number as Indonesian Rupiah, e.g. 1500000 -> "Rp 1.500.000". */
export function rupiah(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

/** Short rupiah for chart axes, e.g. 1500000 -> "1,5 jt". */
export function rupiahShort(value: number): string {
  if (Math.abs(value) >= 1_000_000_000)
    return `${(value / 1_000_000_000).toLocaleString("id-ID", { maximumFractionDigits: 1 })} M`;
  if (Math.abs(value) >= 1_000_000)
    return `${(value / 1_000_000).toLocaleString("id-ID", { maximumFractionDigits: 1 })} jt`;
  if (Math.abs(value) >= 1_000)
    return `${(value / 1_000).toLocaleString("id-ID", { maximumFractionDigits: 0 })} rb`;
  return value.toLocaleString("id-ID");
}

/** "2026-09-13" -> "13 September 2026" */
export function tanggal(iso: string): string {
  return format(parseISO(iso), "d MMMM yyyy", { locale: idLocale });
}

/** "2026-09-13" -> "13 Sep" */
export function tanggalPendek(iso: string): string {
  return format(parseISO(iso), "d MMM", { locale: idLocale });
}

/** "2026-09" -> "September 2026" */
export function namaBulan(monthKey: string): string {
  return format(parseISO(`${monthKey}-01`), "MMMM yyyy", { locale: idLocale });
}

/** "2026-09" -> "Sep 2026" */
export function namaBulanPendek(monthKey: string): string {
  return format(parseISO(`${monthKey}-01`), "MMM yyyy", { locale: idLocale });
}

/** Current month key, e.g. "2026-09". */
export function bulanIni(): string {
  return format(new Date(), "yyyy-MM");
}

/** Normalize a `yyyy-MM` URL param, returning null when invalid. */
export function bulanValid(value: string | null | undefined): string | null {
  if (!value || !/^\d{4}-\d{2}$/.test(value)) return null;
  const parsed = parseISO(`${value}-01`);
  if (!isValid(parsed)) return null;
  return format(parsed, "yyyy-MM") === value ? value : null;
}

/** Normalize a `YYYY-MM-DD` URL param, returning null when invalid. */
export function tanggalValid(value: string | null | undefined): string | null {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const parsed = parseISO(value);
  if (!isValid(parsed)) return null;
  return format(parsed, "yyyy-MM-dd") === value ? value : null;
}

/** Date (YYYY-MM-DD) for the first day of a month key. */
export function awalBulan(monthKey: string): string {
  return format(startOfMonth(parseISO(`${monthKey}-01`)), "yyyy-MM-dd");
}

/** Last day of month as YYYY-MM-DD. */
export function akhirBulan(monthKey: string): string {
  return format(endOfMonth(parseISO(`${monthKey}-01`)), "yyyy-MM-dd");
}

/** Every day in a month as YYYY-MM-DD, oldest first. */
export function hariDalamBulan(monthKey: string): string[] {
  const start = startOfMonth(parseISO(`${monthKey}-01`));
  const end = endOfMonth(start);
  return eachDayOfInterval({ start, end }).map((day) =>
    format(day, "yyyy-MM-dd"),
  );
}

/** List of N month keys ending with `monthKey`, oldest first. e.g. ["2026-04", ..., "2026-09"] */
export function rentangBulan(monthKey: string, n: number): string[] {
  const months: string[] = [];
  let cursor = parseISO(`${monthKey}-01`);
  for (let i = 0; i < n; i++) {
    months.unshift(format(cursor, "yyyy-MM"));
    cursor = subMonths(cursor, 1);
  }
  return months;
}

/** Today as YYYY-MM-DD (server-safe, uses UTC date parts). */
export function hariIni(): string {
  const now = new Date();
  return format(now, "yyyy-MM-dd");
}
