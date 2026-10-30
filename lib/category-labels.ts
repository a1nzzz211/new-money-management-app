import type { CategoryKind } from "@/lib/types";

export const CATEGORY_KIND_ORDER: CategoryKind[] = [
  "expense",
  "income",
  "savings",
];

export const CATEGORY_KIND_LABELS: Record<CategoryKind, string> = {
  expense: "Pengeluaran",
  income: "Pemasukan",
  savings: "Tabungan",
};

export const CATEGORY_KIND_DESCRIPTIONS: Record<CategoryKind, string> = {
  expense: "Kategori untuk mencatat pengeluaran.",
  income: "Kategori untuk mencatat pemasukan.",
  savings: "Kategori untuk mencatat setoran tabungan.",
};

/**
 * Default fallback category name per kind. When a custom category is deleted,
 * its transactions are reassigned to the category with this name.
 */
export const CATEGORY_FALLBACK_NAMES: Record<CategoryKind, string> = {
  expense: "Lain-lain",
  income: "Lainnya",
  savings: "Tabungan",
};
