import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { rupiah } from "@/lib/format";
import type { BudgetStatus } from "@/lib/analytics";
import { PencilIcon, Trash2Icon } from "lucide-react";

interface BudgetCardProps {
  status: BudgetStatus;
  onEdit: () => void;
  onDelete: () => void;
}

const HEALTH_CONFIG = {
  safe: {
    label: "Aman",
    badge: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    bar: "bg-emerald-500",
  },
  warning: {
    label: "Mendekati Batas",
    badge: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    bar: "bg-amber-500",
  },
  over: {
    label: "Melebihi Batas",
    badge: "bg-red-500/10 text-red-600 dark:text-red-400",
    bar: "bg-red-500",
  },
} as const;

export function BudgetCard({ status, onEdit, onDelete }: BudgetCardProps) {
  const { budget, spent, remaining, usedPct } = status;
  const config = HEALTH_CONFIG[status.status];
  const limit = Number(budget.limit_amount);
  const usedPctDisplay = Math.round(usedPct * 100);
  const barWidth = Math.min(usedPctDisplay, 100);

  return (
    <Card className="shadow-xs">
      <CardHeader className="flex flex-row items-start justify-between gap-2 pb-2">
        <div className="flex min-w-0 items-center gap-2">
          <span
            className="size-3 shrink-0 rounded-full"
            style={{ backgroundColor: budget.category?.color ?? "#3b82f6" }}
          />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">
              {budget.category?.name ?? "Kategori"}
            </p>
            <p className="text-xs text-muted-foreground">
              {usedPctDisplay}% terpakai
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <Badge
            variant="secondary"
            className={`border-transparent text-[11px] font-medium ${config.badge}`}
          >
            {config.label}
          </Badge>
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={onEdit}
            title="Edit Anggaran"
            className="text-muted-foreground hover:text-foreground"
          >
            <PencilIcon className="size-3.5" />
            <span className="sr-only">Edit</span>
          </Button>
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={onDelete}
            title="Hapus Anggaran"
            className="text-muted-foreground hover:text-destructive"
          >
            <Trash2Icon className="size-3.5" />
            <span className="sr-only">Hapus</span>
          </Button>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between gap-2">
          <div>
            <p className="text-xs text-muted-foreground">Terpakai</p>
            <p className="text-base font-bold tabular-nums text-foreground">
              {rupiah(spent)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Batas</p>
            <p className="text-base font-bold tabular-nums text-foreground">
              {rupiah(limit)}
            </p>
          </div>
        </div>

        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={`h-full rounded-full transition-all ${config.bar}`}
            style={{ width: `${barWidth}%` }}
          />
        </div>

        {status.status === "over" ? (
          <p className="text-xs font-medium text-red-600 dark:text-red-400">
            Melebihi batas sebesar {rupiah(spent - limit)}
          </p>
        ) : (
          <p className="text-xs text-muted-foreground">
            Sisa anggaran{" "}
            <span className="font-semibold text-foreground">
              {rupiah(remaining)}
            </span>
          </p>
        )}
      </CardContent>
    </Card>
  );
}
