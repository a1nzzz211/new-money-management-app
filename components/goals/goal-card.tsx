import {
  differenceInCalendarDays,
  differenceInCalendarMonths,
  isBefore,
  parseISO,
  startOfDay,
} from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { requiredPerMonth } from "@/lib/analytics";
import type { GoalWithProgress } from "@/lib/data";
import type { GoalStatus } from "@/lib/types";
import { rupiah, tanggal } from "@/lib/format";
import {
  ArchiveIcon,
  PencilIcon,
  PlusIcon,
  RotateCcwIcon,
  Trash2Icon,
} from "lucide-react";

interface GoalCardProps {
  goal: GoalWithProgress;
  isStatusPending: boolean;
  onEdit: () => void;
  onContribute: () => void;
  onDelete: () => void;
  onStatusChange: (status: GoalStatus) => void;
}

const STATUS_CONFIG = {
  active: {
    label: "Aktif",
    badge: "bg-primary/10 text-primary",
  },
  achieved: {
    label: "Tercapai",
    badge: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  },
  archived: {
    label: "Diarsipkan",
    badge: "bg-muted text-muted-foreground",
  },
} as const;

export function GoalCard({
  goal,
  isStatusPending,
  onEdit,
  onContribute,
  onDelete,
  onStatusChange,
}: GoalCardProps) {
  const target = Number(goal.target_amount);
  const saved = Number(goal.saved);
  const isAchieved = goal.status === "achieved" || saved >= target;
  const displayStatus =
    goal.status === "archived" ? "archived" : isAchieved ? "achieved" : "active";
  const config = STATUS_CONFIG[displayStatus];
  const progress = target > 0 ? Math.min(Math.round((saved / target) * 100), 100) : 0;
  const remaining = Math.max(target - saved, 0);

  const today = startOfDay(new Date());
  const deadline = goal.deadline ? parseISO(goal.deadline) : null;
  const deadlinePast = deadline ? isBefore(deadline, today) : false;
  const daysLeft = deadline ? differenceInCalendarDays(deadline, today) : 0;
  const monthsLeft = deadline
    ? Math.max(1, differenceInCalendarMonths(deadline, today))
    : 0;
  const suggested =
    deadline && !isAchieved && !deadlinePast
      ? requiredPerMonth(target, saved, monthsLeft)
      : null;

  const deadlineLabel = deadline
    ? isAchieved
      ? "Tercapai"
      : deadlinePast
        ? "Batas waktu terlewat"
        : daysLeft === 0
          ? "Jatuh tempo hari ini"
          : daysLeft <= 31
            ? `${daysLeft} hari lagi`
            : `${Math.floor(daysLeft / 30)} bulan lagi`
    : null;

  const statusAction =
    goal.status === "archived"
      ? {
          next: "active" as const,
          label: "Aktifkan",
          icon: RotateCcwIcon,
        }
      : {
          next: "archived" as const,
          label: "Arsipkan",
          icon: ArchiveIcon,
        };

  const canContribute = goal.status === "active" && !isAchieved;
  const StatusActionIcon = statusAction.icon;
  const progressColor = isAchieved
    ? "bg-emerald-500"
    : goal.status === "archived"
      ? "bg-muted-foreground"
      : "bg-primary";

  return (
    <Card className="shadow-xs">
      <CardHeader className="flex flex-row items-start justify-between gap-2 pb-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-foreground">
            {goal.name}
          </p>
          <Badge
            variant="secondary"
            className={`mt-1 border-transparent text-[11px] font-medium ${config.badge}`}
          >
            {config.label}
          </Badge>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={onEdit}
            title="Edit Target"
            className="text-muted-foreground hover:text-foreground"
          >
            <PencilIcon className="size-3.5" />
            <span className="sr-only">Edit</span>
          </Button>
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => onStatusChange(statusAction.next)}
            disabled={isStatusPending}
            title={statusAction.label}
            className="text-muted-foreground hover:text-foreground"
          >
            <StatusActionIcon className="size-3.5" />
            <span className="sr-only">{statusAction.label}</span>
          </Button>
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={onDelete}
            title="Hapus Target"
            className="text-muted-foreground hover:text-destructive"
          >
            <Trash2Icon className="size-3.5" />
            <span className="sr-only">Hapus</span>
          </Button>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-3">
        <div className="flex items-end justify-between gap-2">
          <div>
            <p className="text-xs text-muted-foreground">Terkumpul</p>
            <p className="text-base font-bold tabular-nums text-foreground">
              {rupiah(saved)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Target</p>
            <p className="text-base font-bold tabular-nums text-foreground">
              {rupiah(target)}
            </p>
          </div>
        </div>

        <div className="space-y-1">
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={`h-full rounded-full transition-all ${progressColor}`}
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">
              {isAchieved ? "Target tercapai" : `Sisa ${rupiah(remaining)}`}
            </span>
            <span className="font-semibold text-foreground">{progress}%</span>
          </div>
        </div>

        {goal.deadline && deadlineLabel && (
          <div className="flex items-center justify-between gap-2 text-xs">
            <span className="text-muted-foreground">
              Batas: {tanggal(goal.deadline)}
            </span>
            <span
              className={
                deadlinePast && !isAchieved
                  ? "font-medium text-red-600 dark:text-red-400"
                  : "font-medium text-foreground"
              }
            >
              {deadlineLabel}
            </span>
          </div>
        )}

        {suggested !== null && suggested > 0 && (
          <p className="text-xs text-muted-foreground">
            Estimasi sisihkan{" "}
            <span className="font-semibold text-foreground">
              {rupiah(suggested)}
            </span>{" "}
            per bulan.
          </p>
        )}

        {goal.unlinkedContributions > 0 && (
          <p className="rounded-md bg-amber-500/10 px-2 py-1.5 text-[11px] text-amber-700 dark:text-amber-400">
            {goal.unlinkedContributions} setoran tanpa transaksi terkait.
          </p>
        )}

        {canContribute && (
          <Button
            onClick={onContribute}
            size="sm"
            className="mt-1 w-full gap-1.5"
          >
            <PlusIcon className="size-4" />
            Tambah Setoran
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
