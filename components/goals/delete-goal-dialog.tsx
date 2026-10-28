"use client";

import * as React from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { deleteGoal } from "@/lib/actions/goals";
import type { GoalWithProgress } from "@/lib/data";
import { rupiah } from "@/lib/format";
import { toast } from "sonner";
import { Loader2Icon, Trash2Icon } from "lucide-react";

interface DeleteGoalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goal: GoalWithProgress | null;
}

export function DeleteGoalDialog({
  open,
  onOpenChange,
  goal,
}: DeleteGoalDialogProps) {
  const [isPending, startTransition] = React.useTransition();

  if (!goal) return null;

  const handleDelete = () => {
    startTransition(async () => {
      const res = await deleteGoal(goal.id);
      if (!res.ok) {
        toast.error(res.error);
        return;
      }

      toast.success("Target tabungan berhasil dihapus");
      onOpenChange(false);
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="mb-1 flex size-10 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <Trash2Icon className="size-5" />
          </div>
          <AlertDialogTitle>Hapus Target Tabungan?</AlertDialogTitle>
          <AlertDialogDescription>
            Riwayat setoran pada target ini akan dihapus, tetapi transaksi
            tabungan yang sudah tercatat di halaman Transaksi tetap tersimpan.
            Tindakan ini tidak dapat dibatalkan.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-1 rounded-lg border bg-muted/30 p-3 text-xs">
          <div className="flex justify-between font-medium text-foreground">
            <span>{goal.name}</span>
            <span className="font-semibold tabular-nums">
              {rupiah(Number(goal.saved))}
            </span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Dana terkumpul</span>
            <span>Target {rupiah(Number(goal.target_amount))}</span>
          </div>
        </div>

        <AlertDialogFooter>
          <Button
            type="button"
            variant="outline"
            disabled={isPending}
            onClick={() => onOpenChange(false)}
          >
            Batal
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={isPending}
            onClick={handleDelete}
          >
            {isPending && <Loader2Icon className="mr-1.5 size-4 animate-spin" />}
            Hapus Target
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
