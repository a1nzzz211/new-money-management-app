import { z } from "zod";

export const TRANSACTION_TYPES = ["income", "expense", "savings"] as const;
export const CATEGORY_KINDS = ["income", "expense", "savings"] as const;
export const GOAL_STATUSES = ["active", "achieved", "archived"] as const;

/** Predefined colors for categories (hex). */
export const CATEGORY_COLORS = [
  "#ef4444", // red
  "#f97316", // orange
  "#eab308", // yellow
  "#22c55e", // green
  "#14b8a6", // teal
  "#3b82f6", // blue
  "#8b5cf6", // violet
  "#ec4899", // pink
  "#6b7280", // gray
] as const;

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Tanggal harus berformat YYYY-MM-DD");

export const transactionSchema = z.object({
  id: z.string().uuid().optional(),
  type: z.enum(TRANSACTION_TYPES, { message: "Jenis transaksi tidak valid" }),
  categoryId: z.string().uuid({ message: "Pilih kategori" }),
  amount: z.coerce
    .number({ message: "Nominal harus angka" })
    .positive("Nominal harus lebih dari 0")
    .max(1_000_000_000_000, "Nominal terlalu besar"),
  description: z
    .string()
    .trim()
    .max(200, "Maksimal 200 karakter")
    .optional()
    .or(z.literal("")),
  occurredOn: isoDate,
});
export type TransactionFormValues = z.infer<typeof transactionSchema>;

export const categorySchema = z.object({
  id: z.string().uuid().optional(),
  name: z
    .string()
    .trim()
    .min(1, "Nama kategori wajib diisi")
    .max(50, "Maksimal 50 karakter"),
  kind: z.enum(CATEGORY_KINDS, { message: "Jenis kategori tidak valid" }),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Warna tidak valid"),
});
export type CategoryFormValues = z.infer<typeof categorySchema>;

export const budgetSchema = z.object({
  id: z.string().uuid().optional(),
  categoryId: z.string().uuid({ message: "Pilih kategori" }),
  month: z.string().regex(/^\d{4}-\d{2}$/, "Bulan tidak valid"),
  limitAmount: z.coerce
    .number({ message: "Nominal harus angka" })
    .positive("Nominal harus lebih dari 0")
    .max(1_000_000_000_000, "Nominal terlalu besar"),
});
export type BudgetFormValues = z.infer<typeof budgetSchema>;

export const goalSchema = z.object({
  id: z.string().uuid().optional(),
  name: z
    .string()
    .trim()
    .min(1, "Nama target wajib diisi")
    .max(80, "Maksimal 80 karakter"),
  targetAmount: z.coerce
    .number({ message: "Nominal harus angka" })
    .positive("Target harus lebih dari 0")
    .max(1_000_000_000_000, "Nominal terlalu besar"),
  deadline: isoDate.optional().or(z.literal("")),
});
export type GoalFormValues = z.infer<typeof goalSchema>;

export const contributionSchema = z.object({
  goalId: z.string().uuid({ message: "Pilih target" }),
  amount: z.coerce
    .number({ message: "Nominal harus angka" })
    .positive("Nominal harus lebih dari 0")
    .max(1_000_000_000_000, "Nominal terlalu besar"),
  contributedOn: isoDate,
});
export type ContributionFormValues = z.infer<typeof contributionSchema>;

/** Shape returned by every server action. */
export type ActionResult = { ok: true } | { ok: false; error: string };
