import { Card, CardContent } from "@/components/ui/card";
import { rupiah } from "@/lib/format";
import {
  ArrowDownLeftIcon,
  ArrowUpRightIcon,
  PiggyBankIcon,
  WalletMinimalIcon,
} from "lucide-react";

interface AnalyticsStatsProps {
  income: number;
  expense: number;
  savings: number;
  net: number;
}

export function AnalyticsStats({
  income,
  expense,
  savings,
  net,
}: AnalyticsStatsProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <Card className="shadow-xs">
        <CardContent className="p-3.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              Total Pemasukan
            </span>
            <div className="flex size-7 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <ArrowDownLeftIcon className="size-3.5" />
            </div>
          </div>
          <p className="mt-1.5 text-base font-bold tabular-nums text-emerald-600 dark:text-emerald-400 sm:text-lg">
            {rupiah(income)}
          </p>
        </CardContent>
      </Card>

      <Card className="shadow-xs">
        <CardContent className="p-3.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              Total Pengeluaran
            </span>
            <div className="flex size-7 items-center justify-center rounded-md bg-red-500/10 text-red-600 dark:text-red-400">
              <ArrowUpRightIcon className="size-3.5" />
            </div>
          </div>
          <p className="mt-1.5 text-base font-bold tabular-nums text-foreground sm:text-lg">
            {rupiah(expense)}
          </p>
        </CardContent>
      </Card>

      <Card className="shadow-xs">
        <CardContent className="p-3.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              Total Tabungan
            </span>
            <div className="flex size-7 items-center justify-center rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <PiggyBankIcon className="size-3.5" />
            </div>
          </div>
          <p className="mt-1.5 text-base font-bold tabular-nums text-blue-600 dark:text-blue-400 sm:text-lg">
            {rupiah(savings)}
          </p>
        </CardContent>
      </Card>

      <Card className="shadow-xs">
        <CardContent className="p-3.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              Saldo Bersih
            </span>
            <div className="flex size-7 items-center justify-center rounded-md bg-primary/10 text-primary">
              <WalletMinimalIcon className="size-3.5" />
            </div>
          </div>
          <p
            className={`mt-1.5 text-base font-bold tabular-nums sm:text-lg ${
              net < 0
                ? "text-red-600 dark:text-red-400"
                : "text-foreground"
            }`}
          >
            {rupiah(net)}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
