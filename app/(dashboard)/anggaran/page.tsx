import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import {
  listBudgetsForMonth,
  listCategories,
  listMonthTransactions,
} from "@/lib/data";
import { budgetStatuses } from "@/lib/analytics";
import { bulanIni, bulanValid, namaBulan } from "@/lib/format";
import { MonthPicker } from "@/components/shared/month-picker";
import { BudgetStats } from "@/components/budgets/budget-stats";
import { BudgetList } from "@/components/budgets/budget-list";

export const metadata: Metadata = {
  title: "Anggaran",
  description: "Atur batas pengeluaran bulanan per kategori.",
};

interface AnggaranPageProps {
  searchParams: Promise<{ month?: string }>;
}

export default async function AnggaranPage({
  searchParams,
}: AnggaranPageProps) {
  const params = await searchParams;
  const month = bulanValid(params.month) ?? bulanIni();

  const supabase = await createClient();

  const [budgets, monthTxs, categories] = await Promise.all([
    listBudgetsForMonth(supabase, month),
    listMonthTransactions(supabase, month),
    listCategories(supabase, "expense"),
  ]);

  const statuses = budgetStatuses(budgets, monthTxs);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Anggaran
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Kelola batas pengeluaran Anda untuk bulan{" "}
            <span className="font-semibold text-foreground">
              {namaBulan(month)}
            </span>
            .
          </p>
        </div>
        <MonthPicker />
      </div>

      <BudgetStats statuses={statuses} />

      <BudgetList
        statuses={statuses}
        categories={categories}
        month={month}
      />
    </div>
  );
}
