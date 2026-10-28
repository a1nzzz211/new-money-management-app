import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { rupiah, tanggalPendek } from "@/lib/format";
import type { BudgetAdherence, LargestTx } from "@/lib/analytics";
import { CalendarIcon, PiggyBankIcon, TargetIcon, TrendingDownIcon } from "lucide-react";

interface SpendingBehaviorCardProps {
  largest: LargestTx | null;
  dailyAverage: number;
  savingsRate: number;
  adherence: BudgetAdherence;
}

export function SpendingBehaviorCard({
  largest,
  dailyAverage,
  savingsRate,
  adherence,
}: SpendingBehaviorCardProps) {
  const hasBudgets = adherence.budgetCount > 0;
  const adherencePct = Math.round(adherence.usedPct * 100);
  const overBudget = adherence.overCount > 0;

  return (
    <Card className="shadow-xs">
      <CardHeader>
        <CardTitle className="text-base font-semibold">
          Perilaku Pengeluaran
        </CardTitle>
        <CardDescription>
          Insight utama dari transaksi pada periode yang dipilih
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex items-start gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-red-500/10 text-red-600 dark:text-red-400">
              <TrendingDownIcon className="size-4" />
            </div>
            <div className="min-w-0 space-y-0.5">
              <p className="text-xs font-medium text-muted-foreground">
                Pengeluaran Terbesar
              </p>
              <p className="truncate text-sm font-semibold text-foreground">
                {largest ? rupiah(largest.amount) : "Belum ada"}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {largest
                  ? `${largest.description} · ${tanggalPendek(largest.occurredOn)}`
                  : "Tidak ada pengeluaran pada rentang ini"}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <CalendarIcon className="size-4" />
            </div>
            <div className="min-w-0 space-y-0.5">
              <p className="text-xs font-medium text-muted-foreground">
                Rata-rata Pengeluaran Harian
              </p>
              <p className="truncate text-sm font-semibold text-foreground">
                {rupiah(dailyAverage)}
              </p>
              <p className="text-xs text-muted-foreground">
                Dihitung dari seluruh hari dalam periode
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <PiggyBankIcon className="size-4" />
            </div>
            <div className="min-w-0 space-y-0.5">
              <p className="text-xs font-medium text-muted-foreground">
                Rasio Tabungan
              </p>
              <p className="truncate text-sm font-semibold text-foreground">
                {(savingsRate * 100).toFixed(0)}%
              </p>
              <p className="text-xs text-muted-foreground">
                Tabungan dibagi total pemasukan
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div
              className={`flex size-9 shrink-0 items-center justify-center rounded-md ${
                overBudget
                  ? "bg-red-500/10 text-red-600 dark:text-red-400"
                  : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              }`}
            >
              <TargetIcon className="size-4" />
            </div>
            <div className="min-w-0 space-y-0.5">
              <p className="text-xs font-medium text-muted-foreground">
                Ketaatan Anggaran
              </p>
              <p
                className={`truncate text-sm font-semibold ${
                  overBudget
                    ? "text-red-600 dark:text-red-400"
                    : "text-foreground"
                }`}
              >
                {hasBudgets ? `${adherencePct}% terpakai` : "Belum ada anggaran"}
              </p>
              <p className="text-xs text-muted-foreground">
                {hasBudgets
                  ? overBudget
                    ? `${adherence.overCount} dari ${adherence.budgetCount} kategori melebihi batas`
                    : `${adherence.budgetCount} kategori dalam batas`
                  : "Atur anggaran untuk melihat ketaatan"}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
