import Link from "next/link";
import { rupiah } from "@/lib/format";
import type { BudgetStatus } from "@/lib/analytics";

interface BudgetSummaryWidgetProps {
  budgets: BudgetStatus[];
}

export function BudgetSummaryWidget({ budgets }: BudgetSummaryWidgetProps) {
  if (!budgets || budgets.length === 0) {
    return (
      <div className="flex h-[180px] w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed text-sm text-muted-foreground p-4 text-center">
        <p>Belum ada anggaran untuk bulan ini.</p>
        <Link
          href="/anggaran"
          className="text-xs font-medium text-primary hover:underline"
        >
          Atur anggaran bulanan &rarr;
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3.5">
      {budgets.slice(0, 3).map((item) => {
        const pct = Math.round(item.usedPct * 100);
        const limit = Number(item.budget.limit_amount);
        const barColor =
          item.status === "over"
            ? "bg-red-500"
            : item.status === "warning"
              ? "bg-amber-500"
              : "bg-emerald-500";

        return (
          <div key={item.budget.id} className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 font-medium truncate">
                <span
                  className="size-2.5 rounded-full shrink-0"
                  style={{
                    backgroundColor: item.budget.category?.color ?? "#3b82f6",
                  }}
                />
                <span className="truncate">
                  {item.budget.category?.name ?? "Kategori"}
                </span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0 text-muted-foreground">
                <span
                  className={
                    item.status === "over"
                      ? "text-red-600 font-semibold"
                      : ""
                  }
                >
                  {rupiah(item.spent)}
                </span>
                <span>/</span>
                <span>{rupiah(limit)}</span>
              </div>
            </div>

            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className={`h-full rounded-full transition-all ${barColor}`}
                style={{ width: `${Math.min(pct, 100)}%` }}
              />
            </div>

            {item.status === "over" && (
              <p className="text-[11px] text-red-600 font-medium">
                Melebihi anggaran sebesar {rupiah(item.spent - limit)}
              </p>
            )}
          </div>
        );
      })}

      {budgets.length > 3 && (
        <Link
          href="/anggaran"
          className="text-xs font-medium text-primary hover:underline self-end pt-1"
        >
          Lihat semua anggaran ({budgets.length}) &rarr;
        </Link>
      )}
    </div>
  );
}
