import { Card, CardContent } from "@/components/ui/card";
import { rupiah } from "@/lib/format";
import type { BudgetStatus } from "@/lib/analytics";
import {
  AlertTriangleIcon,
  PiggyBankIcon,
  TargetIcon,
  WalletIcon,
} from "lucide-react";

interface BudgetStatsProps {
  statuses: BudgetStatus[];
}

export function BudgetStats({ statuses }: BudgetStatsProps) {
  const totalLimit = statuses.reduce(
    (sum, item) => sum + Number(item.budget.limit_amount),
    0,
  );
  const totalSpent = statuses.reduce((sum, item) => sum + item.spent, 0);
  const remaining = totalLimit - totalSpent;
  const overCount = statuses.filter((item) => item.status === "over").length;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <Card className="shadow-xs">
        <CardContent className="p-3.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              Total Anggaran
            </span>
            <div className="flex size-7 items-center justify-center rounded-md bg-primary/10 text-primary">
              <TargetIcon className="size-3.5" />
            </div>
          </div>
          <p className="mt-1.5 text-base font-bold tabular-nums text-foreground sm:text-lg">
            {rupiah(totalLimit)}
          </p>
        </CardContent>
      </Card>

      <Card className="shadow-xs">
        <CardContent className="p-3.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              Total Terpakai
            </span>
            <div className="flex size-7 items-center justify-center rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <WalletIcon className="size-3.5" />
            </div>
          </div>
          <p className="mt-1.5 text-base font-bold tabular-nums text-foreground sm:text-lg">
            {rupiah(totalSpent)}
          </p>
        </CardContent>
      </Card>

      <Card className="shadow-xs">
        <CardContent className="p-3.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              Sisa Anggaran
            </span>
            <div className="flex size-7 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <PiggyBankIcon className="size-3.5" />
            </div>
          </div>
          <p
            className={`mt-1.5 text-base font-bold tabular-nums sm:text-lg ${
              remaining < 0
                ? "text-red-600 dark:text-red-400"
                : "text-emerald-600 dark:text-emerald-400"
            }`}
          >
            {rupiah(remaining)}
          </p>
        </CardContent>
      </Card>

      <Card className="shadow-xs">
        <CardContent className="p-3.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              Melebihi Batas
            </span>
            <div
              className={`flex size-7 items-center justify-center rounded-md ${
                overCount > 0
                  ? "bg-red-500/10 text-red-600 dark:text-red-400"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              <AlertTriangleIcon className="size-3.5" />
            </div>
          </div>
          <p
            className={`mt-1.5 text-base font-bold tabular-nums sm:text-lg ${
              overCount > 0
                ? "text-red-600 dark:text-red-400"
                : "text-foreground"
            }`}
          >
            {overCount} kategori
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
