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
import { createBudget, updateBudget } from "@/lib/actions/budgets";
import type { BudgetWithCategory } from "@/lib/data";
import type { Category } from "@/lib/types";
import { namaBulan, rupiah } from "@/lib/format";
import { toast } from "sonner";
import { Loader2Icon } from "lucide-react";

interface BudgetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  month: string;
  categories: Category[];
  existingBudgets: BudgetWithCategory[];
  initialData?: BudgetWithCategory | null;
}

interface FormContentProps {
  month: string;
  categories: Category[];
  existingBudgets: BudgetWithCategory[];
  initialData?: BudgetWithCategory | null;
  onClose: () => void;
}

function BudgetFormContent({
  month,
  categories,
  existingBudgets,
  initialData,
  onClose,
}: FormContentProps) {
  const isEditing = Boolean(initialData);

  const availableCategories = React.useMemo(() => {
    if (isEditing) return categories;
    const usedIds = new Set(existingBudgets.map((b) => b.category_id));
    return categories.filter((category) => !usedIds.has(category.id));
  }, [categories, existingBudgets, isEditing]);

  const [categoryId, setCategoryId] = React.useState(
    initialData?.category_id ?? availableCategories[0]?.id ?? "",
  );
  const [limitAmount, setLimitAmount] = React.useState(
    initialData ? String(initialData.limit_amount) : "",
  );
  const [isPending, startTransition] = React.useTransition();

  const parsedAmount = parseFloat(limitAmount);
  const monthLabel = namaBulan(
    isEditing && initialData ? initialData.month.slice(0, 7) : month,
  );

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (!isEditing && !categoryId) {
      toast.error("Pilih kategori pengeluaran");
      return;
    }

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      toast.error("Nominal anggaran harus lebih dari 0");
      return;
    }

    startTransition(async () => {
      const res =
        isEditing && initialData
          ? await updateBudget(initialData.id, {
              limitAmount: parsedAmount,
            })
          : await createBudget({
              categoryId,
              month,
              limitAmount: parsedAmount,
            });

      if (!res.ok) {
        toast.error(res.error);
        return;
      }

      toast.success(
        isEditing
          ? "Anggaran berhasil diperbarui"
          : "Anggaran berhasil ditambahkan",
      );
      onClose();
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-1">
      <div className="flex flex-col gap-1.5">
        <Label
          htmlFor="budget-category"
          className="text-xs font-medium text-muted-foreground"
        >
          Kategori Pengeluaran
        </Label>
        {isEditing ? (
          <div className="flex items-center gap-2 rounded-lg border bg-muted/30 px-2.5 py-2">
            <span
              className="size-2.5 shrink-0 rounded-full"
              style={{
                backgroundColor:
                  initialData?.category?.color ?? "#3b82f6",
              }}
            />
            <span className="text-sm font-medium text-foreground">
              {initialData?.category?.name ?? "Kategori"}
            </span>
          </div>
        ) : availableCategories.length === 0 ? (
          <p className="rounded-lg border border-dashed px-3 py-2 text-xs text-muted-foreground">
            Semua kategori pengeluaran sudah memiliki anggaran bulan ini.
          </p>
        ) : (
          <select
            id="budget-category"
            value={categoryId}
            onChange={(event) => setCategoryId(event.target.value)}
            disabled={isPending}
            required
            className="flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50 dark:bg-input/30"
          >
            {availableCategories.map((category) => (
              <option
                key={category.id}
                value={category.id}
                className="dark:bg-slate-900"
              >
                {category.name}
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label className="text-xs font-medium text-muted-foreground">
          Periode
        </Label>
        <p className="rounded-lg border bg-muted/30 px-2.5 py-2 text-sm font-medium text-foreground">
          {monthLabel}
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <Label
            htmlFor="budget-limit"
            className="text-xs font-medium text-muted-foreground"
          >
            Batas Anggaran (Rp)
          </Label>
          {!isNaN(parsedAmount) && parsedAmount > 0 && (
            <span className="text-xs font-semibold tabular-nums text-foreground">
              {rupiah(parsedAmount)}
            </span>
          )}
        </div>
        <Input
          id="budget-limit"
          type="number"
          min="1"
          step="any"
          placeholder="0"
          value={limitAmount}
          onChange={(event) => setLimitAmount(event.target.value)}
          required
          disabled={isPending}
          autoFocus={!isEditing}
        />
        {isEditing && (
          <p className="text-xs text-muted-foreground">
            Kategori dan periode tidak dapat diubah saat mengedit.
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
        <Button
          type="submit"
          disabled={
            isPending || (!isEditing && availableCategories.length === 0)
          }
        >
          {isPending && <Loader2Icon className="mr-1.5 size-4 animate-spin" />}
          {isEditing ? "Simpan Perubahan" : "Simpan Anggaran"}
        </Button>
      </DialogFooter>
    </form>
  );
}

export function BudgetDialog({
  open,
  onOpenChange,
  month,
  categories,
  existingBudgets,
  initialData,
}: BudgetDialogProps) {
  const isEditing = Boolean(initialData);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Anggaran" : "Tambah Anggaran"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Perbarui batas anggaran untuk kategori ini."
              : "Tentukan batas pengeluaran untuk satu kategori pada bulan ini."}
          </DialogDescription>
        </DialogHeader>

        {open && (
          <BudgetFormContent
            key={initialData?.id ?? `new-${month}`}
            month={month}
            categories={categories}
            existingBudgets={existingBudgets}
            initialData={initialData}
            onClose={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
