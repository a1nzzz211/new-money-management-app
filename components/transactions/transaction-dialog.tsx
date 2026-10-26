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
import { createTransaction, updateTransaction } from "@/lib/actions/transactions";
import type { Category, TransactionType } from "@/lib/types";
import type { TransactionWithCategory } from "@/lib/data";
import { hariIni, rupiah } from "@/lib/format";
import { toast } from "sonner";
import { Loader2Icon, ArrowDownLeftIcon, ArrowUpRightIcon, PiggyBankIcon } from "lucide-react";

interface TransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: Category[];
  initialData?: TransactionWithCategory | null;
  onSuccess?: () => void;
}

interface FormContentProps {
  categories: Category[];
  initialData?: TransactionWithCategory | null;
  onClose: () => void;
  onSuccess?: () => void;
}

function TransactionFormContent({
  categories,
  initialData,
  onClose,
  onSuccess,
}: FormContentProps) {
  const isEditing = Boolean(initialData);

  const [type, setType] = React.useState<TransactionType>(
    initialData?.type ?? "expense"
  );

  const initialCategoryId = React.useMemo(() => {
    if (initialData?.category_id) return initialData.category_id;
    const defaultCat = categories.find((c) => c.kind === "expense");
    return defaultCat ? defaultCat.id : "";
  }, [initialData, categories]);

  const [categoryId, setCategoryId] = React.useState<string>(initialCategoryId);
  const [amount, setAmount] = React.useState<string>(
    initialData ? String(initialData.amount) : ""
  );
  const [occurredOn, setOccurredOn] = React.useState<string>(
    initialData?.occurred_on ?? hariIni()
  );
  const [description, setDescription] = React.useState<string>(
    initialData?.description ?? ""
  );
  const [isPending, startTransition] = React.useTransition();

  // Filter categories matching current transaction type
  const filteredCategories = React.useMemo(() => {
    return categories.filter((c) => c.kind === type);
  }, [categories, type]);

  // When type changes, ensure categoryId matches an available category of that type
  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    const available = categories.filter((c) => c.kind === newType);
    if (!available.some((c) => c.id === categoryId)) {
      setCategoryId(available[0]?.id ?? "");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      toast.error("Nominal harus lebih dari 0");
      return;
    }

    if (!categoryId) {
      toast.error("Pilih kategori transaksi");
      return;
    }

    if (!occurredOn) {
      toast.error("Pilih tanggal transaksi");
      return;
    }

    startTransition(async () => {
      const payload = {
        type,
        categoryId,
        amount: numericAmount,
        occurredOn,
        description: description.trim(),
      };

      const res = isEditing && initialData
        ? await updateTransaction(initialData.id, payload)
        : await createTransaction(payload);

      if (!res.ok) {
        toast.error(res.error);
        return;
      }

      toast.success(
        isEditing
          ? "Transaksi berhasil diperbarui"
          : "Transaksi berhasil dicatat"
      );
      onClose();
      onSuccess?.();
    });
  };

  const parsedAmount = parseFloat(amount);

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-1">
      {/* Transaction Type Segmented Toggle */}
      <div className="flex flex-col gap-1.5">
        <Label className="text-xs font-medium text-muted-foreground">
          Jenis Transaksi
        </Label>
        <div className="grid grid-cols-3 gap-1 rounded-lg bg-muted p-1 text-xs font-medium">
          <button
            type="button"
            onClick={() => handleTypeChange("expense")}
            className={`flex items-center justify-center gap-1.5 rounded-md py-1.5 transition-all ${
              type === "expense"
                ? "bg-background text-red-600 shadow-xs dark:text-red-400 font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <ArrowUpRightIcon className="size-3.5" />
            Pengeluaran
          </button>
          <button
            type="button"
            onClick={() => handleTypeChange("income")}
            className={`flex items-center justify-center gap-1.5 rounded-md py-1.5 transition-all ${
              type === "income"
                ? "bg-background text-emerald-600 shadow-xs dark:text-emerald-400 font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <ArrowDownLeftIcon className="size-3.5" />
            Pemasukan
          </button>
          <button
            type="button"
            onClick={() => handleTypeChange("savings")}
            className={`flex items-center justify-center gap-1.5 rounded-md py-1.5 transition-all ${
              type === "savings"
                ? "bg-background text-blue-600 shadow-xs dark:text-blue-400 font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <PiggyBankIcon className="size-3.5" />
            Tabungan
          </button>
        </div>
      </div>

      {/* Amount */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="amount" className="text-xs font-medium text-muted-foreground">
            Nominal (Rp)
          </Label>
          {!isNaN(parsedAmount) && parsedAmount > 0 && (
            <span className="text-xs font-semibold tabular-nums text-foreground">
              {rupiah(parsedAmount)}
            </span>
          )}
        </div>
        <Input
          id="amount"
          type="number"
          min="1"
          step="any"
          placeholder="0"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
          disabled={isPending}
          autoFocus={!isEditing}
        />
      </div>

      {/* Category */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="category" className="text-xs font-medium text-muted-foreground">
          Kategori
        </Label>
        <div className="relative">
          <select
            id="category"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            disabled={isPending}
            required
            className="flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50 dark:bg-input/30"
          >
            <option value="" disabled className="dark:bg-slate-900">
              Pilih Kategori
            </option>
            {filteredCategories.map((cat) => (
              <option key={cat.id} value={cat.id} className="dark:bg-slate-900">
                {cat.name}
              </option>
            ))}
          </select>
        </div>
        {filteredCategories.length === 0 && (
          <p className="text-xs text-amber-600 dark:text-amber-400">
            Belum ada kategori untuk jenis ini.
          </p>
        )}
      </div>

      {/* Date */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="occurredOn" className="text-xs font-medium text-muted-foreground">
          Tanggal Transaksi
        </Label>
        <Input
          id="occurredOn"
          type="date"
          value={occurredOn}
          onChange={(e) => setOccurredOn(e.target.value)}
          required
          disabled={isPending}
        />
      </div>

      {/* Description */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="description" className="text-xs font-medium text-muted-foreground">
          Catatan / Keterangan (Opsional)
        </Label>
        <Input
          id="description"
          type="text"
          maxLength={200}
          placeholder="mis. Makan siang bersama teman, Tagihan listrik"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
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
          {isEditing ? "Simpan Perubahan" : "Simpan Transaksi"}
        </Button>
      </DialogFooter>
    </form>
  );
}

export function TransactionDialog({
  open,
  onOpenChange,
  categories,
  initialData,
  onSuccess,
}: TransactionDialogProps) {
  const isEditing = Boolean(initialData);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Transaksi" : "Catat Transaksi"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Perbarui rincian transaksi yang sudah dicatat."
              : "Masukkan informasi pengeluaran, pemasukan, atau tabungan Anda."}
          </DialogDescription>
        </DialogHeader>

        {open && (
          <TransactionFormContent
            key={initialData?.id ?? "new-transaction"}
            categories={categories}
            initialData={initialData}
            onClose={() => onOpenChange(false)}
            onSuccess={onSuccess}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

