"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { contributeToGoal } from "@/lib/actions/goals";
import type { GoalWithProgress } from "@/lib/data";
import { hariIni, rupiah } from "@/lib/format";
import { toast } from "sonner";
import { Loader2Icon } from "lucide-react";

interface ContributionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goal: GoalWithProgress | null;
}

interface FormContentProps {
  goal: GoalWithProgress;
  onClose: () => void;
}

function ContributionFormContent({ goal, onClose }: FormContentProps) {
  const [amount, setAmount] = React.useState("");
  const [contributedOn, setContributedOn] = React.useState(hariIni());
  const [isPending, startTransition] = React.useTransition();

  const target = Number(goal.target_amount);
  const saved = Number(goal.saved);
  const remaining = Math.max(target - saved, 0);
  const progress = target > 0 ? Math.min((saved / target) * 100, 100) : 0;
  const parsedAmount = parseFloat(amount);
  const exceedsRemaining = !isNaN(parsedAmount) && parsedAmount > remaining;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      toast.error("Nominal setoran harus lebih dari 0");
      return;
    }

    if (!contributedOn) {
      toast.error("Pilih tanggal setoran");
      return;
    }

    startTransition(async () => {
      const res = await contributeToGoal({
        goalId: goal.id,
        amount: parsedAmount,
        contributedOn,
      });

      if (!res.ok) {
        toast.error(res.error);
        return;
      }

      toast.success("Setoran berhasil dicatat");
      onClose();
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-1">
      <div className="space-y-2 rounded-lg border bg-muted/30 p-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium text-foreground">{goal.name}</span>
          <span className="font-semibold text-primary">
            {Math.round(progress)}%
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
          <span>
            {rupiah(saved)} dari {rupiah(target)}
          </span>
          <span>Sisa {rupiah(remaining)}</span>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <Label
            htmlFor="contribution-amount"
            className="text-xs font-medium text-muted-foreground"
          >
            Nominal Setoran (Rp)
          </Label>
          {!isNaN(parsedAmount) && parsedAmount > 0 && (
            <span className="text-xs font-semibold tabular-nums text-foreground">
              {rupiah(parsedAmount)}
            </span>
          )}
        </div>
        <Input
          id="contribution-amount"
          type="number"
          min="1"
          step="any"
          placeholder="0"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
          required
          disabled={isPending}
          autoFocus
        />
        {exceedsRemaining && (
          <p className="text-xs text-amber-600 dark:text-amber-400">
            Setoran melebihi sisa target. Target akan otomatis ditandai
            tercapai.
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label
          htmlFor="contribution-date"
          className="text-xs font-medium text-muted-foreground"
        >
          Tanggal Setoran
        </Label>
        <Input
          id="contribution-date"
          type="date"
          value={contributedOn}
          onChange={(event) => setContributedOn(event.target.value)}
          required
          disabled={isPending}
        />
      </div>

      <DialogFooter className="mt-2">
        <Button
          type="button"
          variant="outline"
          disabled={isPending}
          onClick={onClose}
        >
          Batal
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2Icon className="mr-1.5 size-4 animate-spin" />}
          Simpan Setoran
        </Button>
      </DialogFooter>
    </form>
  );
}

export function ContributionDialog({
  open,
  onOpenChange,
  goal,
}: ContributionDialogProps) {
  if (!goal) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Tambah Setoran</DialogTitle>
          <DialogDescription>
            Catat setoran baru untuk target {goal.name}.
          </DialogDescription>
        </DialogHeader>

        {open && (
          <ContributionFormContent
            key={goal.id}
            goal={goal}
            onClose={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
