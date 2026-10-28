"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { GoalCard } from "@/components/goals/goal-card";
import { GoalDialog } from "@/components/goals/goal-dialog";
import { ContributionDialog } from "@/components/goals/contribution-dialog";
import { DeleteGoalDialog } from "@/components/goals/delete-goal-dialog";
import { updateGoalStatus } from "@/lib/actions/goals";
import type { GoalWithProgress } from "@/lib/data";
import type { GoalStatus } from "@/lib/types";
import { toast } from "sonner";
import {
  ArchiveIcon,
  PlusIcon,
  TargetIcon,
  TrophyIcon,
} from "lucide-react";

interface GoalListProps {
  goals: GoalWithProgress[];
  status: GoalStatus;
}

const EMPTY_CONFIG = {
  active: {
    title: "Belum ada target aktif",
    description:
      "Buat target tabungan pertama Anda dan mulai sisihkan dana secara rutin.",
    icon: TargetIcon,
  },
  achieved: {
    title: "Belum ada target tercapai",
    description:
      "Target yang berhasil mencapai nominal akan muncul di sini.",
    icon: TrophyIcon,
  },
  archived: {
    title: "Belum ada target diarsipkan",
    description: "Target yang Anda arsipkan akan muncul di sini.",
    icon: ArchiveIcon,
  },
} as const;

export function GoalList({ goals, status }: GoalListProps) {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingGoal, setEditingGoal] =
    React.useState<GoalWithProgress | null>(null);
  const [contributingGoal, setContributingGoal] =
    React.useState<GoalWithProgress | null>(null);
  const [deletingGoal, setDeletingGoal] =
    React.useState<GoalWithProgress | null>(null);
  const [isStatusPending, startStatusTransition] = React.useTransition();

  const emptyConfig = EMPTY_CONFIG[status];
  const EmptyIcon = emptyConfig.icon;

  const openAdd = () => {
    setEditingGoal(null);
    setDialogOpen(true);
  };

  const openEdit = (goal: GoalWithProgress) => {
    setEditingGoal(goal);
    setDialogOpen(true);
  };

  const handleStatusChange = (goal: GoalWithProgress, next: GoalStatus) => {
    startStatusTransition(async () => {
      const res = await updateGoalStatus(goal.id, next);
      if (!res.ok) {
        toast.error(res.error);
        return;
      }

      toast.success(
        next === "active"
          ? "Target berhasil diaktifkan"
          : "Target berhasil diarsipkan",
      );
    });
  };

  return (
    <>
      <div className="flex flex-col gap-4">
        {goals.length === 0 ? (
          <div className="flex min-h-[300px] w-full flex-col items-center justify-center gap-3 rounded-xl border border-dashed bg-card/50 p-8 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <EmptyIcon className="size-6" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">
                {emptyConfig.title}
              </p>
              <p className="max-w-sm text-xs text-muted-foreground">
                {emptyConfig.description}
              </p>
            </div>
            <Button onClick={openAdd} size="sm" className="mt-2 gap-1.5">
              <PlusIcon className="size-4" />
              Buat Target
            </Button>
          </div>
        ) : (
          <>
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <p className="text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">
                  {goals.length}
                </span>{" "}
                target {status === "active" ? "aktif" : status === "achieved" ? "tercapai" : "diarsipkan"}
              </p>
              <Button
                onClick={openAdd}
                size="sm"
                className="gap-1.5 self-start sm:self-auto"
              >
                <PlusIcon className="size-4" />
                Buat Target
              </Button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {goals.map((goal) => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  isStatusPending={isStatusPending}
                  onEdit={() => openEdit(goal)}
                  onContribute={() => setContributingGoal(goal)}
                  onDelete={() => setDeletingGoal(goal)}
                  onStatusChange={(next) => handleStatusChange(goal, next)}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <GoalDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initialData={editingGoal}
      />

      <ContributionDialog
        open={Boolean(contributingGoal)}
        onOpenChange={(open) => {
          if (!open) setContributingGoal(null);
        }}
        goal={contributingGoal}
      />

      <DeleteGoalDialog
        open={Boolean(deletingGoal)}
        onOpenChange={(open) => {
          if (!open) setDeletingGoal(null);
        }}
        goal={deletingGoal}
      />
    </>
  );
}
