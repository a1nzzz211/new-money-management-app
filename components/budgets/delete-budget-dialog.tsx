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
import { deleteBudget } from "@/lib/actions/budgets";
import type { BudgetWithCategory } from "@/lib/data";
import { namaBulan, rupiah } from "@/lib/format";
import { toast } from "sonner";
import { Loader2Icon, Trash2Icon } from "lucide-react";

interface DeleteBudgetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  budget: BudgetWithCategory | null;
}

export function DeleteBudgetDialog({
  open,
  onOpenChange,
  budget,
}: DeleteBudgetDialogProps) {
  const [isPending, startTransition] = React.useTransition();

  if (!budget) return null;

  const handleDelete = () => {
    startTransition(async () => {
      const res = await deleteBudget(budget.id);
      if (!res.ok) {
        toast.error(res.error);
        return;
      }

      toast.success("Anggaran berhasil dihapus");
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
          <AlertDialogTitle>Hapus Anggaran?</AlertDialogTitle>
          <AlertDialogDescription>
            Apakah Anda yakin ingin menghapus anggaran ini? Tindakan ini tidak
            dapat dibatalkan.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-1 rounded-lg border bg-muted/30 p-3 text-xs">
          <div className="flex justify-between font-medium text-foreground">
            <span>{budget.category?.name ?? "Kategori"}</span>
            <span className="font-semibold tabular-nums">
              {rupiah(Number(budget.limit_amount))}
            </span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>{namaBulan(budget.month.slice(0, 7))}</span>
            <span>Batas pengeluaran</span>
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
            Hapus Anggaran
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
