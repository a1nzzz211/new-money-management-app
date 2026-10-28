import { differenceInCalendarDays, endOfMonth, parseISO } from "date-fns";
import type { MonthlySummaryRow, TransactionWithCategory } from "@/lib/data";
import type { BudgetWithCategory } from "@/lib/data";
import {
  awalBulan,
  hariDalamBulan,
  hariIni,
  rentangBulan,
} from "@/lib/format";

export const ANALYTICS_RANGES = [1, 3, 6, 12] as const;
export type AnalyticsRange = (typeof ANALYTICS_RANGES)[number];
export const DEFAULT_ANALYTICS_RANGE: AnalyticsRange = 6;

/** Normalize an `range` URL param, falling back to the default range. */
export function parseAnalyticsRange(
  value: string | null | undefined,
): AnalyticsRange {
  const numeric = Number(value);
  return (ANALYTICS_RANGES as readonly number[]).includes(numeric)
    ? (numeric as AnalyticsRange)
    : DEFAULT_ANALYTICS_RANGE;
}

export interface MonthTotals {
  month: string; // yyyy-MM
  income: number;
  expense: number;
  savings: number;
  net: number; // income - expense - savings
  savingsRate: number; // savings / income (0 when income === 0)
  netMargin: number; // net / income (0 when income === 0)
}

export function emptyMonthTotals(month: string): MonthTotals {
  return {
    month,
    income: 0,
    expense: 0,
    savings: 0,
    net: 0,
    savingsRate: 0,
    netMargin: 0,
  };
}

/** Shared finalization so totalsByMonth/totalsFromSummary cannot drift. */
function finalizeTotals(
  acc: Record<string, MonthTotals>,
): Record<string, MonthTotals> {
  for (const m of Object.values(acc)) {
    m.net = m.income - m.expense - m.savings;
    m.savingsRate = m.income > 0 ? m.savings / m.income : 0;
    m.netMargin = m.income > 0 ? m.net / m.income : 0;
  }
  return acc;
}

/** Aggregate raw transactions into per-month totals. */
export function totalsByMonth(
  txs: TransactionWithCategory[],
): Record<string, MonthTotals> {
  const acc: Record<string, MonthTotals> = {};
  for (const t of txs) {
    const key = t.occurred_on.slice(0, 7);
    const m = (acc[key] ??= emptyMonthTotals(key));
    if (t.type === "income") m.income += Number(t.amount);
    else if (t.type === "expense") m.expense += Number(t.amount);
    else m.savings += Number(t.amount);
  }
  return finalizeTotals(acc);
}

/** Aggregate raw transactions into per-day totals keyed by yyyy-MM-dd. */
export function totalsByDay(
  txs: TransactionWithCategory[],
): Record<string, MonthTotals> {
  const acc: Record<string, MonthTotals> = {};
  for (const t of txs) {
    const key = t.occurred_on.slice(0, 10);
    const m = (acc[key] ??= emptyMonthTotals(key));
    if (t.type === "income") m.income += Number(t.amount);
    else if (t.type === "expense") m.expense += Number(t.amount);
    else m.savings += Number(t.amount);
  }
  return finalizeTotals(acc);
}

/** Aggregate the monthly_summary view rows into MonthTotals keyed by yyyy-MM. */
export function totalsFromSummary(
  rows: MonthlySummaryRow[],
): Record<string, MonthTotals> {
  const acc: Record<string, MonthTotals> = {};
  for (const r of rows) {
    const key = r.month.slice(0, 7);
    const m = (acc[key] ??= emptyMonthTotals(key));
    if (r.type === "income") m.income += Number(r.total);
    else if (r.type === "expense") m.expense += Number(r.total);
    else m.savings += Number(r.total);
  }
  return finalizeTotals(acc);
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

/** Average daily spend across a period, given its total number of days. */
export function dailyAverage(expense: number, days: number): number {
  return days > 0 ? expense / days : 0;
}

/** Number of calendar days in an inclusive `yyyy-MM` month range. */
export function daysInRange(fromMonth: string, toMonth: string): number {
  const start = parseISO(`${fromMonth}-01`);
  const end = endOfMonth(parseISO(`${toMonth}-01`));
  return differenceInCalendarDays(end, start) + 1;
}

export type BudgetHealth = "safe" | "warning" | "over";

export interface BudgetStatus {
  budget: BudgetWithCategory;
  spent: number;
  remaining: number;
  usedPct: number; // 0..n (can exceed 1)
  over: boolean;
  status: BudgetHealth;
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
    const usedPct = limit > 0 ? spent / limit : 0;
    const over = spent > limit;
    const status: BudgetHealth = over
      ? "over"
      : usedPct >= 0.8
        ? "warning"
        : "safe";

    return {
      budget: b,
      spent,
      remaining: limit - spent,
      usedPct,
      over,
      status,
    };
  });
}

export interface BudgetAdherence {
  budgetCount: number;
  totalLimit: number;
  totalSpent: number;
  remaining: number;
  usedPct: number; // 0..n (can exceed 1)
  overCount: number;
}

/**
 * Aggregate budget adherence across an inclusive month range.
 * Only expense transactions are counted, matched per budget month + category.
 */
export function budgetAdherence(
  budgets: BudgetWithCategory[],
  txs: TransactionWithCategory[],
): BudgetAdherence {
  const spentByMonthCategory: Record<string, number> = {};
  for (const t of txs) {
    if (t.type !== "expense" || !t.category_id) continue;
    const key = `${t.occurred_on.slice(0, 7)}|${t.category_id}`;
    spentByMonthCategory[key] =
      (spentByMonthCategory[key] ?? 0) + Number(t.amount);
  }

  let totalLimit = 0;
  let totalSpent = 0;
  let overCount = 0;

  for (const b of budgets) {
    const limit = Number(b.limit_amount);
    const monthKey = b.month.slice(0, 7);
    const spent = spentByMonthCategory[`${monthKey}|${b.category_id}`] ?? 0;
    totalLimit += limit;
    totalSpent += spent;
    if (spent > limit) overCount += 1;
  }

  return {
    budgetCount: budgets.length,
    totalLimit,
    totalSpent,
    remaining: totalLimit - totalSpent,
    usedPct: totalLimit > 0 ? totalSpent / totalLimit : 0,
    overCount,
  };
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

export interface AnalyticsTotals {
  income: number;
  expense: number;
  savings: number;
  net: number;
}

export type TrendGranularity = "day" | "month";

export interface AnalyticsSnapshot {
  range: AnalyticsRange;
  granularity: TrendGranularity;
  series: MonthTotals[];
  totals: AnalyticsTotals;
  savingsRate: number;
  days: number;
  dailyAverage: number;
  largest: LargestTx | null;
  adherence: BudgetAdherence;
  categories: CategorySlice[];
  hasTransactions: boolean;
}

/**
 * Build every view model the analytics page needs for one range from a single
 * dataset. Computing this on the server keeps the client payload compact and
 * lets the range selector switch instantly without another round trip.
 */
export function buildAnalyticsSnapshot(
  allTransactions: TransactionWithCategory[],
  allBudgets: BudgetWithCategory[],
  currentMonth: string,
  range: AnalyticsRange,
): AnalyticsSnapshot {
  const months = rentangBulan(currentMonth, range);
  const fromMonth = months[0];
  const fromISO = awalBulan(fromMonth);

  const transactions = allTransactions.filter((t) => t.occurred_on >= fromISO);
  const budgets = allBudgets.filter((b) => b.month.slice(0, 7) >= fromMonth);

  // A single month is spread by day so the chart is not one lonely bar.
  const granularity: TrendGranularity = range === 1 ? "day" : "month";
  const keys =
    granularity === "day"
      ? hariDalamBulan(currentMonth).filter((day) => day <= hariIni())
      : months;
  const totalsMap =
    granularity === "day"
      ? totalsByDay(transactions)
      : totalsByMonth(transactions);
  const series = keys.map((key) => totalsMap[key] ?? emptyMonthTotals(key));

  const totals = series.reduce<AnalyticsTotals>(
    (acc, month) => ({
      income: acc.income + month.income,
      expense: acc.expense + month.expense,
      savings: acc.savings + month.savings,
      net: acc.net + month.net,
    }),
    { income: 0, expense: 0, savings: 0, net: 0 },
  );

  const days = daysInRange(fromMonth, currentMonth);

  return {
    range,
    granularity,
    series,
    totals,
    savingsRate: totals.income > 0 ? totals.savings / totals.income : 0,
    days,
    dailyAverage: dailyAverage(totals.expense, days),
    largest: largestExpense(transactions),
    adherence: budgetAdherence(budgets, transactions),
    categories: byCategory(transactions),
    hasTransactions: transactions.length > 0,
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
