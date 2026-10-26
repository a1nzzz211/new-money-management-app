import Link from "next/link";
import { rupiah, tanggalPendek } from "@/lib/format";
import type { TransactionWithCategory } from "@/lib/data";
import {
  ArrowDownLeftIcon,
  ArrowUpRightIcon,
  PiggyBankIcon,
} from "lucide-react";

interface RecentTransactionsProps {
  transactions: TransactionWithCategory[];
}

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  if (!transactions || transactions.length === 0) {
    return (
      <div className="flex h-[200px] w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed text-sm text-muted-foreground">
        <p>Belum ada transaksi tercatat.</p>
        <Link
          href="/transaksi"
          className="text-xs font-medium text-primary hover:underline"
        >
          Mulai catat transaksi pertama Anda &rarr;
        </Link>
      </div>
    );
  }

  return (
    <div className="divide-y divide-border">
      {transactions.map((tx) => {
        const isIncome = tx.type === "income";
        const isSavings = tx.type === "savings";

        return (
          <div
            key={tx.id}
            className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${
                  isIncome
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    : isSavings
                      ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                      : "bg-red-500/10 text-red-600 dark:text-red-400"
                }`}
              >
                {isIncome ? (
                  <ArrowDownLeftIcon className="size-4" />
                ) : isSavings ? (
                  <PiggyBankIcon className="size-4" />
                ) : (
                  <ArrowUpRightIcon className="size-4" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">
                  {tx.description?.trim() || tx.category?.name || "Transaksi"}
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{tanggalPendek(tx.occurred_on)}</span>
                  <span>&bull;</span>
                  <span
                    className="inline-flex items-center gap-1 truncate"
                    style={{ color: tx.category?.color ?? "inherit" }}
                  >
                    {tx.category?.name ?? "Tanpa kategori"}
                  </span>
                </div>
              </div>
            </div>

            <div className="text-right shrink-0 pl-2">
              <p
                className={`text-sm font-semibold tabular-nums ${
                  isIncome
                    ? "text-emerald-600 dark:text-emerald-400"
                    : isSavings
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-foreground"
                }`}
              >
                {isIncome ? "+" : isSavings ? "" : "-"}
                {rupiah(Number(tx.amount))}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
