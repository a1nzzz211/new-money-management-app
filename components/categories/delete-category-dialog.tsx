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
import { deleteCategory } from "@/lib/actions/categories";
import {
  CATEGORY_FALLBACK_NAMES,
  CATEGORY_KIND_LABELS,
} from "@/lib/category-labels";
import type { Category } from "@/lib/types";
import { toast } from "sonner";
import { Loader2Icon, Trash2Icon } from "lucide-react";

interface DeleteCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: Category | null;
  usageCount: number;
}

export function DeleteCategoryDialog({
  open,
  onOpenChange,
  category,
  usageCount,
}: DeleteCategoryDialogProps) {
  const [isPending, startTransition] = React.useTransition();

  if (!category) return null;

  const fallbackName = CATEGORY_FALLBACK_NAMES[category.kind];

  const handleDelete = () => {
    startTransition(async () => {
      const res = await deleteCategory(category.id);
      if (!res.ok) {
        toast.error(res.error);
        return;
      }

      toast.success("Kategori berhasil dihapus");
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
          <AlertDialogTitle>Hapus Kategori?</AlertDialogTitle>
          <AlertDialogDescription>
            Kategori akan dihapus permanen. Tindakan ini tidak dapat dibatalkan.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-1 rounded-lg border bg-muted/30 p-3 text-xs">
          <div className="flex justify-between font-medium text-foreground">
            <span className="flex items-center gap-1.5">
              <span
                className="size-2.5 rounded-full"
                style={{ backgroundColor: category.color }}
              />
              {category.name}
            </span>
            <span>{CATEGORY_KIND_LABELS[category.kind]}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Dipakai pada</span>
            <span>{usageCount} transaksi</span>
          </div>
        </div>

        <div className="space-y-1.5 text-xs text-muted-foreground">
          {usageCount > 0 ? (
            <p>
              {usageCount} transaksi akan dipindahkan ke kategori{" "}
              <span className="font-semibold text-foreground">
                {fallbackName}
              </span>
              .
            </p>
          ) : (
            <p>Tidak ada transaksi yang menggunakan kategori ini.</p>
          )}
          {category.kind === "expense" && (
            <p>Anggaran yang terkait kategori ini juga akan ikut terhapus.</p>
          )}
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
            Hapus Kategori
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
