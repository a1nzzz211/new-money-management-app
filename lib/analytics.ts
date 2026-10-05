import type { MonthlySummaryRow, TransactionWithCategory } from "@/lib/data";
import type { BudgetWithCategory } from "@/lib/data";

export interface MonthTotals {
  month: string; // yyyy-MM
  income: number;
  expense: number;
  savings: number;
  net: number; // income - expense - savings
  savingsRate: number; // net / income (0 when income === 0)
}

/** Aggregate raw transactions into per-month totals. */
export function totalsByMonth(
  txs: TransactionWithCategory[],
): Record<string, MonthTotals> {
  const acc: Record<string, MonthTotals> = {};
  for (const t of txs) {
    const key = t.occurred_on.slice(0, 7);
    const m = (acc[key] ??= {
      month: key,
      income: 0,
      expense: 0,
      savings: 0,
      net: 0,
      savingsRate: 0,
    });
    if (t.type === "income") m.income += Number(t.amount);
    else if (t.type === "expense") m.expense += Number(t.amount);
    else m.savings += Number(t.amount);
  }
  for (const m of Object.values(acc)) {
    m.net = m.income - m.expense - m.savings;
    m.savingsRate = m.income > 0 ? m.net / m.income : 0;
  }
  return acc;
}

/** Aggregate the monthly_summary view rows into MonthTotals keyed by yyyy-MM. */
export function totalsFromSummary(
  rows: MonthlySummaryRow[],
): Record<string, MonthTotals> {
  const acc: Record<string, MonthTotals> = {};
  for (const r of rows) {
    const key = r.month.slice(0, 7);
    const m = (acc[key] ??= {
      month: key,
      income: 0,
      expense: 0,
      savings: 0,
      net: 0,
      savingsRate: 0,
    });
    if (r.type === "income") m.income += Number(r.total);
    else if (r.type === "expense") m.expense += Number(r.total);
    else m.savings += Number(r.total);
  }
  for (const m of Object.values(acc)) {
    m.net = m.income - m.expense - m.savings;
    m.savingsRate = m.income > 0 ? m.net / m.income : 0;
  }
  return acc;
}

export interface CategorySlice {
  categoryId: string;
  name: string;
  color: string;
  total: number;
  share: number; // fraction of the whole
  count: number;
}

/** Break an expense set down by category, sorted desc. */
export function byCategory(txs: TransactionWithCategory[]): CategorySlice[] {
  const acc: Record<string, CategorySlice> = {};
  let grand = 0;
  for (const t of txs) {
    if (t.type !== "expense") continue;
    const id = t.category_id ?? "none";
    const slice = (acc[id] ??= {
      categoryId: id,
      name: t.category?.name ?? "Tanpa kategori",
      color: t.category?.color ?? "#6b7280",
      total: 0,
      share: 0,
      count: 0,
    });
    slice.total += Number(t.amount);
    slice.count += 1;
    grand += Number(t.amount);
  }
  const list = Object.values(acc);
  for (const s of list) s.share = grand > 0 ? s.total / grand : 0;
  return list.sort((a, b) => b.total - a.total);
}

/** Month-over-month percentage change of expense between two keys. */
export function momChange(current: number, previous: number): number | null {
  if (previous === 0) return current === 0 ? 0 : null;
  return (current - previous) / previous;
}

/** Average daily spend for a month, given number of days elapsed/total. */
export function avgDaily(expense: number, days: number): number {
  return days > 0 ? expense / days : 0;
}

export interface BudgetStatus {
  budget: BudgetWithCategory;
  spent: number;
  remaining: number;
  usedPct: number; // 0..n (can exceed 1)
  over: boolean;
}

/** Compute spent/remaining per budget against a month's transactions. */
export function budgetStatuses(
  budgets: BudgetWithCategory[],
  monthTxs: TransactionWithCategory[],
): BudgetStatus[] {
  const spentByCat: Record<string, number> = {};
  for (const t of monthTxs) {
    if (t.type !== "expense" || !t.category_id) continue;
    spentByCat[t.category_id] =
      (spentByCat[t.category_id] ?? 0) + Number(t.amount);
  }
  return budgets.map((b) => {
    const spent = spentByCat[b.category_id] ?? 0;
    const limit = Number(b.limit_amount);
    return {
      budget: b,
      spent,
      remaining: limit - spent,
      usedPct: limit > 0 ? spent / limit : 0,
      over: spent >= limit,
    };
  });
}

export interface LargestTx {
  id: string;
  amount: number;
  description: string;
  categoryName: string;
  color: string;
  occurredOn: string;
}

/** The single biggest expense in a set. */
export function largestExpense(
  txs: TransactionWithCategory[],
): LargestTx | null {
  let best: TransactionWithCategory | null = null;
  for (const t of txs) {
    if (t.type !== "expense") continue;
    if (!best || Number(t.amount) > Number(best.amount)) best = t;
  }
  if (!best) return null;
  return {
    id: best.id,
    amount: Number(best.amount),
    description: best.description?.trim() || best.category?.name || "Transaksi",
    categoryName: best.category?.name ?? "-",
    color: best.category?.color ?? "#6b7280",
    occurredOn: best.occurred_on,
  };
}

/**
 * Estimated monthly amount still needed to reach a savings goal.
 * Returns null when there is no deadline (cannot compute a pace).
 */
export function requiredPerMonth(
  target: number,
  saved: number,
  monthsLeft: number,
): number | null {
  const remaining = target - saved;
  if (remaining <= 0) return 0;
  if (monthsLeft <= 0) return null;
  return remaining / monthsLeft;
}
