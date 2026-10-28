"use client";

import * as React from "react";
import { isBefore, parseISO, startOfDay } from "date-fns";
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
import { createGoal, updateGoal } from "@/lib/actions/goals";
import type { GoalWithProgress } from "@/lib/data";
import { rupiah } from "@/lib/format";
import { toast } from "sonner";
import { Loader2Icon } from "lucide-react";

interface GoalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: GoalWithProgress | null;
}

interface FormContentProps {
  initialData?: GoalWithProgress | null;
  onClose: () => void;
}

function GoalFormContent({ initialData, onClose }: FormContentProps) {
  const isEditing = Boolean(initialData);

  const [name, setName] = React.useState(initialData?.name ?? "");
  const [targetAmount, setTargetAmount] = React.useState(
    initialData ? String(initialData.target_amount) : "",
  );
  const [deadline, setDeadline] = React.useState(initialData?.deadline ?? "");
  const [isPending, startTransition] = React.useTransition();

  const parsedTarget = parseFloat(targetAmount);
  const deadlinePast =
    Boolean(deadline) &&
    isBefore(parseISO(deadline), startOfDay(new Date()));

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (!name.trim()) {
      toast.error("Nama target wajib diisi");
      return;
    }

    if (isNaN(parsedTarget) || parsedTarget <= 0) {
      toast.error("Target nominal harus lebih dari 0");
      return;
    }

    startTransition(async () => {
      const payload = {
        name: name.trim(),
        targetAmount: parsedTarget,
        deadline: deadline || "",
      };

      const res =
        isEditing && initialData
          ? await updateGoal(initialData.id, payload)
          : await createGoal(payload);

      if (!res.ok) {
        toast.error(res.error);
        return;
      }

      toast.success(
        isEditing
          ? "Target tabungan berhasil diperbarui"
          : "Target tabungan berhasil dibuat",
      );
      onClose();
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-1">
      <div className="flex flex-col gap-1.5">
        <Label
          htmlFor="goal-name"
          className="text-xs font-medium text-muted-foreground"
        >
          Nama Target
        </Label>
        <Input
          id="goal-name"
          type="text"
          maxLength={80}
          placeholder="mis. Dana Darurat, Liburan Bali"
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
          disabled={isPending}
          autoFocus
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <Label
            htmlFor="goal-target"
            className="text-xs font-medium text-muted-foreground"
          >
            Target Nominal (Rp)
          </Label>
          {!isNaN(parsedTarget) && parsedTarget > 0 && (
            <span className="text-xs font-semibold tabular-nums text-foreground">
              {rupiah(parsedTarget)}
            </span>
          )}
        </div>
        <Input
          id="goal-target"
          type="number"
          min="1"
          step="any"
          placeholder="0"
          value={targetAmount}
          onChange={(event) => setTargetAmount(event.target.value)}
          required
          disabled={isPending}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label
          htmlFor="goal-deadline"
          className="text-xs font-medium text-muted-foreground"
        >
          Batas Waktu (Opsional)
        </Label>
        <Input
          id="goal-deadline"
          type="date"
          value={deadline}
          onChange={(event) => setDeadline(event.target.value)}
          disabled={isPending}
        />
        {deadlinePast && (
          <p className="text-xs text-amber-600 dark:text-amber-400">
            Batas waktu sudah lewat. Target tetap dapat disimpan, tetapi akan
            ditandai sebagai terlewat.
          </p>
        )}
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
          {isEditing ? "Simpan Perubahan" : "Buat Target"}
        </Button>
      </DialogFooter>
    </form>
  );
}

export function GoalDialog({
  open,
  onOpenChange,
  initialData,
}: GoalDialogProps) {
  const isEditing = Boolean(initialData);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Target Tabungan" : "Buat Target Tabungan"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Perbarui nama, nominal target, atau batas waktu."
              : "Tentukan target tabungan agar progres keuangan lebih terarah."}
          </DialogDescription>
        </DialogHeader>

        {open && (
          <GoalFormContent
            key={initialData?.id ?? "new-goal"}
            initialData={initialData}
            onClose={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
