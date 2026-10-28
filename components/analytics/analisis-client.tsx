"use client";

import * as React from "react";
import Link from "next/link";
import {
  DEFAULT_ANALYTICS_RANGE,
  parseAnalyticsRange,
  type AnalyticsRange,
  type AnalyticsSnapshot,
} from "@/lib/analytics";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TimeframeSelector } from "@/components/analytics/timeframe-selector";
import { AnalyticsStats } from "@/components/analytics/analytics-stats";
import { MonthlyTrendChart } from "@/components/analytics/monthly-trend-chart";
import { CategoryPieChart } from "@/components/analytics/category-pie-chart";
import { SpendingBehaviorCard } from "@/components/analytics/spending-behavior-card";
import { ArrowRightIcon, BarChart3Icon } from "lucide-react";

interface AnalisisClientProps {
  initialRange: AnalyticsRange;
  snapshots: Record<AnalyticsRange, AnalyticsSnapshot>;
}

export function AnalisisClient({
  initialRange,
  snapshots,
}: AnalisisClientProps) {
  const [range, setRange] = React.useState<AnalyticsRange>(initialRange);

  const selectRange = React.useCallback((next: AnalyticsRange) => {
    setRange(next);

    const url = new URL(window.location.href);
    if (next === DEFAULT_ANALYTICS_RANGE) {
      url.searchParams.delete("range");
    } else {
      url.searchParams.set("range", String(next));
    }
    window.history.replaceState(null, "", url.toString());
  }, []);

  React.useEffect(() => {
    const syncFromUrl = () => {
      const value = new URLSearchParams(window.location.search).get("range");
      setRange(parseAnalyticsRange(value));
    };
    window.addEventListener("popstate", syncFromUrl);
    return () => window.removeEventListener("popstate", syncFromUrl);
  }, []);

  const snapshot = snapshots[range];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Analisis
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Ringkasan tren keuangan Anda dalam{" "}
            <span className="font-semibold text-foreground">
              {range} bulan terakhir
            </span>
            .
          </p>
        </div>
        <TimeframeSelector value={range} onChange={selectRange} />
      </div>

      {!snapshot.hasTransactions ? (
        <div className="flex min-h-[360px] w-full flex-col items-center justify-center gap-3 rounded-xl border border-dashed bg-card/50 p-8 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <BarChart3Icon className="size-6" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">
              Belum ada data untuk dianalisis
            </p>
            <p className="max-w-sm text-xs text-muted-foreground">
              Catat transaksi pada rentang ini terlebih dahulu agar grafik dan
              insight keuangan bisa ditampilkan.
            </p>
          </div>
          <Link
            href="/transaksi"
            className={cn(buttonVariants({ size: "sm" }), "mt-2 gap-1.5")}
          >
            Catat Transaksi
            <ArrowRightIcon className="size-4" />
          </Link>
        </div>
      ) : (
        <>
          <AnalyticsStats
            income={snapshot.totals.income}
            expense={snapshot.totals.expense}
            savings={snapshot.totals.savings}
            net={snapshot.totals.net}
          />

          <div className="grid gap-6 lg:grid-cols-7">
            <Card className="shadow-xs lg:col-span-4">
              <CardHeader>
                <CardTitle className="text-base font-semibold">
                  Tren Arus Kas
                </CardTitle>
                <CardDescription>
                  Pemasukan, pengeluaran, tabungan, dan saldo bersih per{" "}
                  {snapshot.granularity === "day" ? "hari" : "bulan"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <MonthlyTrendChart
                  data={snapshot.series}
                  range={range}
                  granularity={snapshot.granularity}
                />
              </CardContent>
            </Card>

            <Card className="shadow-xs lg:col-span-3">
              <CardHeader>
                <CardTitle className="text-base font-semibold">
                  Distribusi Pengeluaran
                </CardTitle>
                <CardDescription>Porsi pengeluaran per kategori</CardDescription>
              </CardHeader>
              <CardContent>
                <CategoryPieChart data={snapshot.categories} />
              </CardContent>
            </Card>
          </div>

          <SpendingBehaviorCard
            largest={snapshot.largest}
            dailyAverage={snapshot.dailyAverage}
            savingsRate={snapshot.savingsRate}
            adherence={snapshot.adherence}
          />
        </>
      )}
    </div>
  );
}
