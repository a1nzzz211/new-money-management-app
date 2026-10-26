import { Card, CardContent } from "@/components/ui/card";
import { rupiah } from "@/lib/format";
import type { TransactionWithCategory } from "@/lib/data";
import {
  ArrowDownLeftIcon,
  ArrowUpRightIcon,
  PiggyBankIcon,
  WalletIcon,
} from "lucide-react";

interface TransactionStatsProps {
  transactions: TransactionWithCategory[];
}

export function TransactionStats({ transactions }: TransactionStatsProps) {
  let income = 0;
  let expense = 0;
  let savings = 0;

  for (const t of transactions) {
    const val = Number(t.amount);
    if (t.type === "income") income += val;
    else if (t.type === "expense") expense += val;
    else if (t.type === "savings") savings += val;
  }

  const net = income - expense - savings;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {/* Saldo Bersih */}
      <Card className="shadow-xs">
        <CardContent className="p-3.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              Arus Kas Bersih
            </span>
            <div className="flex size-7 items-center justify-center rounded-md bg-primary/10 text-primary">
              <WalletIcon className="size-3.5" />
            </div>
          </div>
          <p
            className={`mt-1.5 text-base sm:text-lg font-bold tabular-nums ${
              net >= 0
                ? "text-foreground"
                : "text-red-600 dark:text-red-400"
            }`}
          >
            {rupiah(net)}
          </p>
        </CardContent>
      </Card>

      {/* Pemasukan */}
      <Card className="shadow-xs">
        <CardContent className="p-3.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              Pemasukan
            </span>
            <div className="flex size-7 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <ArrowDownLeftIcon className="size-3.5" />
            </div>
          </div>
          <p className="mt-1.5 text-base sm:text-lg font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
            {rupiah(income)}
          </p>
        </CardContent>
      </Card>

      {/* Pengeluaran */}
      <Card className="shadow-xs">
        <CardContent className="p-3.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              Pengeluaran
            </span>
            <div className="flex size-7 items-center justify-center rounded-md bg-red-500/10 text-red-600 dark:text-red-400">
              <ArrowUpRightIcon className="size-3.5" />
            </div>
          </div>
          <p className="mt-1.5 text-base sm:text-lg font-bold tabular-nums text-red-600 dark:text-red-400">
            {rupiah(expense)}
          </p>
        </CardContent>
      </Card>

      {/* Tabungan */}
      <Card className="shadow-xs">
        <CardContent className="p-3.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              Tabungan
            </span>
            <div className="flex size-7 items-center justify-center rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <PiggyBankIcon className="size-3.5" />
            </div>
          </div>
          <p className="mt-1.5 text-base sm:text-lg font-bold tabular-nums text-blue-600 dark:text-blue-400">
            {rupiah(savings)}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

