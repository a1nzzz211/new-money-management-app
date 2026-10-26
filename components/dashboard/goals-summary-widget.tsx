import Link from "next/link";
import { rupiah, tanggalPendek } from "@/lib/format";
import type { GoalWithProgress } from "@/lib/data";

interface GoalsSummaryWidgetProps {
  goals: GoalWithProgress[];
}

export function GoalsSummaryWidget({ goals }: GoalsSummaryWidgetProps) {
  if (!goals || goals.length === 0) {
    return (
      <div className="flex h-[180px] w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed text-sm text-muted-foreground p-4 text-center">
        <p>Belum ada target tabungan aktif.</p>
        <Link
          href="/tabungan"
          className="text-xs font-medium text-primary hover:underline"
        >
          Buat target tabungan &rarr;
        </Link>
      </div>
    );
  }

  const activeGoals = goals.filter((g) => g.status === "active");

  return (
    <div className="flex flex-col gap-3.5">
      {(activeGoals.length > 0 ? activeGoals : goals)
        .slice(0, 3)
        .map((goal) => {
          const target = Number(goal.target_amount);
          const saved = Number(goal.saved);
          const pct =
            target > 0 ? Math.min(Math.round((saved / target) * 100), 100) : 0;
          const isAchieved = goal.status === "achieved" || saved >= target;

          return (
            <div key={goal.id} className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-foreground truncate">
                  {goal.name}
                </span>
                <span className="font-semibold text-primary">{pct}%</span>
              </div>

              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className={`h-full rounded-full transition-all ${
                    isAchieved ? "bg-emerald-500" : "bg-primary"
                  }`}
                  style={{ width: `${pct}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                <span>
                  {rupiah(saved)} dari {rupiah(target)}
                </span>
                {goal.deadline ? (
                  <span>Batas: {tanggalPendek(goal.deadline)}</span>
                ) : isAchieved ? (
                  <span className="text-emerald-600 font-medium">
                    Tercapai!
                  </span>
                ) : null}
              </div>
            </div>
          );
        })}

      {goals.length > 3 && (
        <Link
          href="/tabungan"
          className="text-xs font-medium text-primary hover:underline self-end pt-1"
        >
          Lihat semua target ({goals.length}) &rarr;
        </Link>
      )}
    </div>
  );
}
