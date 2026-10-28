import { Card, CardContent } from "@/components/ui/card";
import { rupiah } from "@/lib/format";
import type { GoalWithProgress } from "@/lib/data";
import { PiggyBankIcon, TargetIcon, TrendingUpIcon } from "lucide-react";

interface GoalStatsProps {
  goals: GoalWithProgress[];
}

export function GoalStats({ goals }: GoalStatsProps) {
  const totalSaved = goals.reduce((sum, goal) => sum + Number(goal.saved), 0);
  const activeTarget = goals
    .filter((goal) => goal.status === "active")
    .reduce((sum, goal) => sum + Number(goal.target_amount), 0);

  const averageProgress =
    goals.length > 0
      ? goals.reduce((sum, goal) => {
          const target = Number(goal.target_amount);
          const saved = Number(goal.saved);
          const pct = target > 0 ? Math.min(saved / target, 1) * 100 : 0;
          return sum + pct;
        }, 0) / goals.length
      : 0;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      <Card className="shadow-xs">
        <CardContent className="p-3.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              Total Terkumpul
            </span>
            <div className="flex size-7 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <PiggyBankIcon className="size-3.5" />
            </div>
          </div>
          <p className="mt-1.5 text-base font-bold tabular-nums text-emerald-600 dark:text-emerald-400 sm:text-lg">
            {rupiah(totalSaved)}
          </p>
        </CardContent>
      </Card>

      <Card className="shadow-xs">
        <CardContent className="p-3.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              Target Aktif
            </span>
            <div className="flex size-7 items-center justify-center rounded-md bg-primary/10 text-primary">
              <TargetIcon className="size-3.5" />
            </div>
          </div>
          <p className="mt-1.5 text-base font-bold tabular-nums text-foreground sm:text-lg">
            {rupiah(activeTarget)}
          </p>
        </CardContent>
      </Card>

      <Card className="col-span-2 shadow-xs sm:col-span-1">
        <CardContent className="p-3.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              Rata-rata Capaian
            </span>
            <div className="flex size-7 items-center justify-center rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <TrendingUpIcon className="size-3.5" />
            </div>
          </div>
          <p className="mt-1.5 text-base font-bold tabular-nums text-blue-600 dark:text-blue-400 sm:text-lg">
            {averageProgress.toFixed(0)}%
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
