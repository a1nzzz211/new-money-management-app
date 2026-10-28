import type { createClient } from "@/lib/supabase/server";
import type {
  Budget,
  Category,
  Profile,
  SavingsGoal,
  Transaction,
  TransactionType,
} from "@/lib/types";
import {
  akhirBulan,
  awalBulan,
  bulanIni,
  rentangBulan,
} from "@/lib/format";

type Client = Awaited<ReturnType<typeof createClient>>;

export type TransactionWithCategory = Transaction & {
  category: Pick<Category, "id" | "name" | "color" | "kind"> | null;
};

export type BudgetWithCategory = Budget & {
  category: Pick<Category, "id" | "name" | "color" | "kind"> | null;
};

export type GoalWithProgress = SavingsGoal & {
  saved: number;
  unlinkedContributions: number;
};

// ---------------------------------------------------------------------------
// Profile
// ---------------------------------------------------------------------------
export async function getProfile(
  client: Client,
  userId?: string,
): Promise<Profile | null> {
  let id = userId;

  if (!id) {
    const {
      data: { user },
    } = await client.auth.getUser();
    id = user?.id;
  }

  if (!id) return null;

  const { data } = await client
    .from("profiles")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  return (data as unknown as Profile) ?? null;
}

export async function getUserId(client: Client): Promise<string | null> {
  const {
    data: { user },
  } = await client.auth.getUser();
  return user?.id ?? null;
}

// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------
export async function listCategories(
  client: Client,
  kind?: Category["kind"],
): Promise<Category[]> {
  let query = client.from("categories").select("*").order("name");
  if (kind) query = query.eq("kind", kind);
  const { data } = await query;
  return (data as Category[]) ?? [];
}

// ---------------------------------------------------------------------------
// Transactions
// ---------------------------------------------------------------------------
const TX_SELECT = "*, category:categories(id, name, color, kind)";

export interface TxFilters {
  month?: string; // "yyyy-MM" -> restrict to that month
  from?: string; // ISO date lower bound (inclusive)
  to?: string; // ISO date upper bound (inclusive)
  type?: TransactionType;
  categoryId?: string;
  search?: string;
  page?: number; // 0-based
  pageSize?: number;
}

export async function listTransactions(
  client: Client,
  filters: TxFilters = {},
): Promise<{ rows: TransactionWithCategory[]; count: number }> {
  const pageSize = filters.pageSize ?? 20;
  const page = filters.page ?? 0;

  let query = client
    .from("transactions")
    .select(TX_SELECT, { count: "exact" })
    .order("occurred_on", { ascending: false })
    .order("created_at", { ascending: false });

  if (filters.month) {
    query = query
      .gte("occurred_on", awalBulan(filters.month))
      .lte("occurred_on", akhirBulan(filters.month));
  }
  if (filters.from) query = query.gte("occurred_on", filters.from);
  if (filters.to) query = query.lte("occurred_on", filters.to);
  if (filters.type) query = query.eq("type", filters.type);
  if (filters.categoryId) query = query.eq("category_id", filters.categoryId);
  if (filters.search) {
    query = query.ilike("description", `%${filters.search}%`);
  }

  const from = page * pageSize;
  const to = from + pageSize - 1;
  query = query.range(from, to);

  const { data, count } = await query;
  return {
    rows: (data as unknown as TransactionWithCategory[]) ?? [],
    count: count ?? 0,
  };
}

export async function listRecentTransactions(
  client: Client,
  limit = 5,
): Promise<TransactionWithCategory[]> {
  const { data } = await client
    .from("transactions")
    .select(TX_SELECT)
    .order("occurred_on", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data as unknown as TransactionWithCategory[]) ?? [];
}

/** All transactions within a month (no pagination) - used for aggregation. */
export async function listMonthTransactions(
  client: Client,
  month: string,
): Promise<TransactionWithCategory[]> {
  const { data } = await client
    .from("transactions")
    .select(TX_SELECT)
    .gte("occurred_on", awalBulan(month))
    .lte("occurred_on", akhirBulan(month))
    .order("occurred_on", { ascending: false });
  return (data as unknown as TransactionWithCategory[]) ?? [];
}

/** All transactions since a date (for analytics trends). */
export async function listTransactionsSince(
  client: Client,
  sinceISO: string,
): Promise<TransactionWithCategory[]> {
  const { data } = await client
    .from("transactions")
    .select(TX_SELECT)
    .gte("occurred_on", sinceISO)
    .order("occurred_on", { ascending: true });
  return (data as unknown as TransactionWithCategory[]) ?? [];
}

// ---------------------------------------------------------------------------
// Monthly summary view (chart source)
// ---------------------------------------------------------------------------
export interface MonthlySummaryRow {
  month: string;
  type: TransactionType;
  total: number;
  count: number;
}

export async function getMonthlySummary(
  client: Client,
  months: number,
): Promise<MonthlySummaryRow[]> {
  // Use the same local-month helpers as the rest of the app so the range
  // never shifts around month boundaries (see R10 in TASK.md).
  const since = awalBulan(rentangBulan(bulanIni(), Math.max(1, months))[0]);
  const { data } = await client
    .from("monthly_summary")
    .select("month, type, total, count")
    .gte("month", since)
    .order("month", { ascending: true });
  return normalizeSummary(data);
}

function normalizeSummary(
  data: Array<Record<string, unknown>> | null,
): MonthlySummaryRow[] {
  return (data ?? []).map((r) => ({
    month: String(r.month).slice(0, 10),
    type: r.type as TransactionType,
    total: Number(r.total ?? 0),
    count: Number(r.count ?? 0),
  }));
}

// ---------------------------------------------------------------------------
// Budgets
// ---------------------------------------------------------------------------
export async function listBudgetsForMonth(
  client: Client,
  month: string,
): Promise<BudgetWithCategory[]> {
  const { data } = await client
    .from("budgets")
    .select("*, category:categories(id, name, color, kind)")
    .eq("month", `${month}-01`)
    .order("created_at", { ascending: true });
  return (data as unknown as BudgetWithCategory[]) ?? [];
}

// ---------------------------------------------------------------------------
// Savings goals
// ---------------------------------------------------------------------------
export async function listGoals(client: Client): Promise<SavingsGoal[]> {
  const { data } = await client
    .from("savings_goals")
    .select("*")
    .order("created_at", { ascending: false });
  return (data as SavingsGoal[]) ?? [];
}

/** Sum of contributions per goal id. */
export async function getGoalTotals(
  client: Client,
): Promise<Record<string, number>> {
  const { data } = await client
    .from("goal_contributions")
    .select("goal_id, amount");
  const totals: Record<string, number> = {};
  const rows =
    (data as unknown as Array<{ goal_id: string; amount: number }>) ?? [];
  for (const row of rows) {
    totals[row.goal_id] = (totals[row.goal_id] ?? 0) + Number(row.amount);
  }
  return totals;
}

/** Count contributions whose linked savings transaction was deleted. */
export async function getGoalUnlinkedContributions(
  client: Client,
): Promise<Record<string, number>> {
  const { data } = await client
    .from("goal_contributions")
    .select("goal_id, transaction_id");

  const counts: Record<string, number> = {};
  const rows =
    (data as unknown as Array<{
      goal_id: string;
      transaction_id: string | null;
    }>) ?? [];

  for (const row of rows) {
    if (row.transaction_id === null) {
      counts[row.goal_id] = (counts[row.goal_id] ?? 0) + 1;
    }
  }

  return counts;
}

export async function listGoalsWithProgress(
  client: Client,
): Promise<GoalWithProgress[]> {
  const [goals, totals, unlinked] = await Promise.all([
    listGoals(client),
    getGoalTotals(client),
    getGoalUnlinkedContributions(client),
  ]);
  return goals.map((g) => ({
    ...g,
    saved: totals[g.id] ?? 0,
    unlinkedContributions: unlinked[g.id] ?? 0,
  }));
}
