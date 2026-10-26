import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  listMonthTransactions,
  listRecentTransactions,
  getMonthlySummary,
  listBudgetsForMonth,
  listGoalsWithProgress,
} from "@/lib/data";
import {
  totalsByMonth,
  totalsFromSummary,
  byCategory,
  budgetStatuses,
  momChange,
  type MonthTotals,
} from "@/lib/analytics";
import { bulanIni, namaBulan, rentangBulan, rupiah } from "@/lib/format";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { TrendChart } from "@/components/dashboard/trend-chart";
import { CategoryBreakdown } from "@/components/dashboard/category-breakdown";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
import { BudgetSummaryWidget } from "@/components/dashboard/budget-summary-widget";
import { GoalsSummaryWidget } from "@/components/dashboard/goals-summary-widget";
import {
  ArrowDownLeftIcon,
  ArrowUpRightIcon,
  PiggyBankIcon,
  PlusIcon,
  TrendingDownIcon,
  TrendingUpIcon,
  WalletMinimalIcon,
} from "lucide-react";

export default async function DashboardPage() {
  const supabase = await createClient();
  const currentMonth = bulanIni();
  const prevMonth = rentangBulan(currentMonth, 2)[0];

  const [
    currentMonthTxs,
    prevMonthTxs,
    recentTxs,
    summaryRows,
    budgets,
    goals,
  ] = await Promise.all([
    listMonthTransactions(supabase, currentMonth),
    listMonthTransactions(supabase, prevMonth),
    listRecentTransactions(supabase, 5),
    getMonthlySummary(supabase, 6),
    listBudgetsForMonth(supabase, currentMonth),
    listGoalsWithProgress(supabase),
  ]);

  // Aggregations
  const curTotals = totalsByMonth(currentMonthTxs)[currentMonth] ?? {
    month: currentMonth,
    income: 0,
    expense: 0,
    savings: 0,
    net: 0,
    savingsRate: 0,
  };

  const prevTotals = totalsByMonth(prevMonthTxs)[prevMonth] ?? {
    month: prevMonth,
    income: 0,
    expense: 0,
    savings: 0,
    net: 0,
    savingsRate: 0,
  };

  const expenseMoM = momChange(curTotals.expense, prevTotals.expense);
  const categories = byCategory(currentMonthTxs);
  const budgetList = budgetStatuses(budgets, currentMonthTxs);

  // 6-month trend data
  const summaryMap = totalsFromSummary(summaryRows);
  const last6Months = rentangBulan(currentMonth, 6);
  const trendData: MonthTotals[] = last6Months.map(
    (m) =>
      summaryMap[m] ?? {
        month: m,
        income: 0,
        expense: 0,
        savings: 0,
        net: 0,
        savingsRate: 0,
      },
  );

  const incomeTxCount = currentMonthTxs.filter(
    (t) => t.type === "income",
  ).length;

  return (
    <div className="flex flex-col gap-6">
      {/* Top Welcome / Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Dashboard
          </h1>
          <p className="text-sm text-muted-foreground">
            Ringkasan aktivitas keuangan Anda pada bulan{" "}
            <span className="font-semibold text-foreground">
              {namaBulan(currentMonth)}
            </span>
            .
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/transaksi"
            className={cn(buttonVariants({ size: "sm" }), "gap-1.5 shadow-xs")}
          >
            <PlusIcon className="size-4" />
            Catat Transaksi
          </Link>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Saldo Bersih */}
        <Card className="shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Saldo Bersih
            </CardTitle>
            <div className="flex size-8 items-center justify-center rounded-md bg-primary/10 text-primary">
              <WalletMinimalIcon className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight">
              {rupiah(curTotals.net)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {curTotals.net >= 0
                ? "Surplus kas bulan ini"
                : "Defisit kas bulan ini"}
            </p>
          </CardContent>
        </Card>

        {/* Card 2: Pemasukan */}
        <Card className="shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Pemasukan
            </CardTitle>
            <div className="flex size-8 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <ArrowDownLeftIcon className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
              {rupiah(curTotals.income)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {incomeTxCount} transaksi pemasukan
            </p>
          </CardContent>
        </Card>

        {/* Card 3: Pengeluaran */}
        <Card className="shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Pengeluaran
            </CardTitle>
            <div className="flex size-8 items-center justify-center rounded-md bg-red-500/10 text-red-600 dark:text-red-400">
              <ArrowUpRightIcon className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight text-foreground">
              {rupiah(curTotals.expense)}
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
              {expenseMoM !== null ? (
                <>
                  <span
                    className={`inline-flex items-center font-medium ${
                      expenseMoM > 0
                        ? "text-red-600"
                        : expenseMoM < 0
                          ? "text-emerald-600"
                          : "text-muted-foreground"
                    }`}
                  >
                    {expenseMoM > 0 ? (
                      <TrendingUpIcon className="size-3.5 mr-0.5 inline" />
                    ) : expenseMoM < 0 ? (
                      <TrendingDownIcon className="size-3.5 mr-0.5 inline" />
                    ) : null}
                    {expenseMoM > 0 ? "+" : ""}
                    {(expenseMoM * 100).toFixed(1)}%
                  </span>
                  <span>vs bulan lalu</span>
                </>
              ) : (
                <span>Data bulan lalu belum ada</span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Card 4: Tabungan */}
        <Card className="shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tabungan & Investasi
            </CardTitle>
            <div className="flex size-8 items-center justify-center rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <PiggyBankIcon className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight text-blue-600 dark:text-blue-400">
              {rupiah(curTotals.savings)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Rasio tabungan:{" "}
              <span className="font-semibold text-foreground">
                {(curTotals.savingsRate * 100).toFixed(0)}%
              </span>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Row 2: Trend Chart + Category Breakdown */}
      <div className="grid gap-6 lg:grid-cols-7">
        {/* Trend Chart (4 cols on lg) */}
        <Card className="lg:col-span-4 shadow-xs">
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              Tren Arus Kas (6 Bulan)
            </CardTitle>
            <CardDescription>
              Perbandingan pemasukan dan pengeluaran setiap bulan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TrendChart data={trendData} />
          </CardContent>
        </Card>

        {/* Category Breakdown (3 cols on lg) */}
        <Card className="lg:col-span-3 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold">
                Kategori Pengeluaran
              </CardTitle>
              <CardDescription>Bulan {namaBulan(currentMonth)}</CardDescription>
            </div>
            <Link
              href="/analisis"
              className="text-xs font-medium text-primary hover:underline"
            >
              Detail &rarr;
            </Link>
          </CardHeader>
          <CardContent>
            <CategoryBreakdown categories={categories} />
          </CardContent>
        </Card>
      </div>

      {/* Row 3: Recent Transactions + Budget/Goals widgets */}
      <div className="grid gap-6 lg:grid-cols-7">
        {/* Recent Transactions (4 cols on lg) */}
        <Card className="lg:col-span-4 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold">
                Transaksi Terkini
              </CardTitle>
              <CardDescription>5 aktivitas transaksi terakhir</CardDescription>
            </div>
            <Link
              href="/transaksi"
              className="text-xs font-medium text-primary hover:underline"
            >
              Lihat Semua &rarr;
            </Link>
          </CardHeader>
          <CardContent>
            <RecentTransactions transactions={recentTxs} />
          </CardContent>
        </Card>

        {/* Quick Side Widgets (3 cols on lg) */}
        <div className="flex flex-col gap-6 lg:col-span-3">
          {/* Budget Widget */}
          <Card className="shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-sm font-semibold">
                  Status Anggaran
                </CardTitle>
                <CardDescription className="text-xs">
                  {namaBulan(currentMonth)}
                </CardDescription>
              </div>
              <Link
                href="/anggaran"
                className="text-xs font-medium text-primary hover:underline"
              >
                Kelola
              </Link>
            </CardHeader>
            <CardContent>
              <BudgetSummaryWidget budgets={budgetList} />
            </CardContent>
          </Card>

          {/* Goals Widget */}
          <Card className="shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-sm font-semibold">
                  Target Tabungan
                </CardTitle>
                <CardDescription className="text-xs">
                  Progres tabungan Anda
                </CardDescription>
              </div>
              <Link
                href="/tabungan"
                className="text-xs font-medium text-primary hover:underline"
              >
                Kelola
              </Link>
            </CardHeader>
            <CardContent>
              <GoalsSummaryWidget goals={goals} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
