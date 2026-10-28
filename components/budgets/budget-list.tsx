"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { BudgetCard } from "@/components/budgets/budget-card";
import { BudgetDialog } from "@/components/budgets/budget-dialog";
import { DeleteBudgetDialog } from "@/components/budgets/delete-budget-dialog";
import type { BudgetStatus } from "@/lib/analytics";
import type { BudgetWithCategory } from "@/lib/data";
import type { Category } from "@/lib/types";
import { PlusIcon, TargetIcon } from "lucide-react";

interface BudgetListProps {
  statuses: BudgetStatus[];
  categories: Category[];
  month: string;
}

export function BudgetList({
  statuses,
  categories,
  month,
}: BudgetListProps) {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingBudget, setEditingBudget] =
    React.useState<BudgetWithCategory | null>(null);
  const [deletingBudget, setDeletingBudget] =
    React.useState<BudgetWithCategory | null>(null);

  const existingBudgets = React.useMemo(
    () => statuses.map((status) => status.budget),
    [statuses],
  );

  const openAdd = () => {
    setEditingBudget(null);
    setDialogOpen(true);
  };

  const openEdit = (budget: BudgetWithCategory) => {
    setEditingBudget(budget);
    setDialogOpen(true);
  };

  return (
    <>
      <div className="flex flex-col gap-4">
        {statuses.length === 0 ? (
          <div className="flex min-h-[300px] w-full flex-col items-center justify-center gap-3 rounded-xl border border-dashed bg-card/50 p-8 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <TargetIcon className="size-6" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">
                Belum ada anggaran bulan ini
              </p>
              <p className="max-w-sm text-xs text-muted-foreground">
                Tentukan batas pengeluaran per kategori agar pengeluaran Anda
                lebih terkontrol.
              </p>
            </div>
            <Button onClick={openAdd} size="sm" className="mt-2 gap-1.5">
              <PlusIcon className="size-4" />
              Tambah Anggaran
            </Button>
          </div>
        ) : (
          <>
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <p className="text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">
                  {statuses.length}
                </span>{" "}
                kategori dianggarkan
              </p>
              <Button
                onClick={openAdd}
                size="sm"
                className="gap-1.5 self-start sm:self-auto"
              >
                <PlusIcon className="size-4" />
                Tambah Anggaran
              </Button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {statuses.map((status) => (
                <BudgetCard
                  key={status.budget.id}
                  status={status}
                  onEdit={() => openEdit(status.budget)}
                  onDelete={() => setDeletingBudget(status.budget)}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <BudgetDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        month={month}
        categories={categories}
        existingBudgets={existingBudgets}
        initialData={editingBudget}
      />

      <DeleteBudgetDialog
        open={Boolean(deletingBudget)}
        onOpenChange={(open) => {
          if (!open) setDeletingBudget(null);
        }}
        budget={deletingBudget}
      />
    </>
  );
}
