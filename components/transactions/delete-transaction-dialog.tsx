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
import { deleteTransaction } from "@/lib/actions/transactions";
import type { TransactionWithCategory } from "@/lib/data";
import { rupiah, tanggal } from "@/lib/format";
import { toast } from "sonner";
import { Loader2Icon, Trash2Icon } from "lucide-react";

interface DeleteTransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction: TransactionWithCategory | null;
  onSuccess?: () => void;
}

export function DeleteTransactionDialog({
  open,
  onOpenChange,
  transaction,
  onSuccess,
}: DeleteTransactionDialogProps) {
  const [isPending, startTransition] = React.useTransition();

  if (!transaction) return null;

  const handleDelete = () => {
    startTransition(async () => {
      const res = await deleteTransaction(transaction.id);
      if (!res.ok) {
        toast.error(res.error);
        return;
      }

      toast.success("Transaksi berhasil dihapus");
      onOpenChange(false);
      onSuccess?.();
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex size-10 items-center justify-center rounded-full bg-destructive/10 text-destructive mb-1">
            <Trash2Icon className="size-5" />
          </div>
          <AlertDialogTitle>Hapus Transaksi?</AlertDialogTitle>
          <AlertDialogDescription>
            Apakah Anda yakin ingin menghapus transaksi ini? Tindakan ini tidak
            dapat dibatalkan.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="rounded-lg border bg-muted/30 p-3 text-xs space-y-1">
          <div className="flex justify-between font-medium text-foreground">
            <span>
              {transaction.description ||
                transaction.category?.name ||
                "Transaksi"}
            </span>
            <span className="tabular-nums font-semibold">
              {rupiah(Number(transaction.amount))}
            </span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>{transaction.category?.name ?? "Tanpa kategori"}</span>
            <span>{tanggal(transaction.occurred_on)}</span>
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
            {isPending && (
              <Loader2Icon className="mr-1.5 size-4 animate-spin" />
            )}
            Hapus Transaksi
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
