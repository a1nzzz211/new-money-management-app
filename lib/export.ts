import type { TransactionWithCategory } from "@/lib/data";
import type { TransactionType } from "@/lib/types";
import { tanggalValid } from "@/lib/format";

export const CSV_HEADERS = [
  "Tanggal",
  "Jenis",
  "Kategori",
  "Nominal",
  "Catatan",
] as const;

export const TRANSACTION_TYPE_LABELS: Record<TransactionType, string> = {
  income: "Pemasukan",
  expense: "Pengeluaran",
  savings: "Tabungan",
};

export type ExportRange = { from?: string; to?: string };

export type ExportRangeResult =
  | { ok: true; range: ExportRange }
  | { ok: false; error: string };

/** Parse and validate `from`/`to` query params shared by CSV and XLSX export. */
export function parseExportRange(
  searchParams: URLSearchParams,
): ExportRangeResult {
  const rawFrom = searchParams.get("from");
  const rawTo = searchParams.get("to");

  const from = tanggalValid(rawFrom);
  const to = tanggalValid(rawTo);

  if ((rawFrom && !from) || (rawTo && !to)) {
    return { ok: false, error: "Format tanggal tidak valid" };
  }

  if (from && to && from > to) {
    return {
      ok: false,
      error: "Tanggal awal tidak boleh melebihi tanggal akhir",
    };
  }

  return { ok: true, range: { from: from ?? undefined, to: to ?? undefined } };
}

/**
 * Escape a single CSV cell.
 * - Prefix values starting with `=`, `+`, `-`, or `@` to prevent formula injection.
 * - Quote cells containing quotes, commas, or line breaks.
 */
export function escapeCsvCell(value: string): string {
  let cell = value;

  if (/^[=+\-@]/.test(cell)) {
    cell = `'${cell}`;
  }

  if (/[",\r\n]/.test(cell)) {
    cell = `"${cell.replace(/"/g, '""')}"`;
  }

  return cell;
}

/** Build a UTF-8 (BOM-prefixed) CSV document for the given transactions. */
export function transactionsToCsv(rows: TransactionWithCategory[]): string {
  const lines: string[] = [CSV_HEADERS.join(",")];

  for (const tx of rows) {
    lines.push(
      [
        tx.occurred_on,
        TRANSACTION_TYPE_LABELS[tx.type],
        tx.category?.name ?? "",
        String(tx.amount),
        tx.description ?? "",
      ]
        .map(escapeCsvCell)
        .join(","),
    );
  }

  return `\uFEFF${lines.join("\r\n")}\r\n`;
}
