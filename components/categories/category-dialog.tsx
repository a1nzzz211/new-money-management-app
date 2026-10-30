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
import { createCategory, updateCategory } from "@/lib/actions/categories";
import {
  CATEGORY_KIND_DESCRIPTIONS,
  CATEGORY_KIND_LABELS,
  CATEGORY_KIND_ORDER,
} from "@/lib/category-labels";
import type { Category, CategoryKind } from "@/lib/types";
import { CATEGORY_COLORS } from "@/lib/validation";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Loader2Icon } from "lucide-react";

interface CategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: Category | null;
  defaultKind?: CategoryKind;
}

interface FormContentProps {
  initialData?: Category | null;
  defaultKind: CategoryKind;
  onClose: () => void;
}

function CategoryFormContent({
  initialData,
  defaultKind,
  onClose,
}: FormContentProps) {
  const isEditing = Boolean(initialData);
  const isDefault = initialData?.is_default ?? false;

  const [name, setName] = React.useState(initialData?.name ?? "");
  const [kind, setKind] = React.useState<CategoryKind>(
    initialData?.kind ?? defaultKind,
  );
  const [color, setColor] = React.useState(
    initialData?.color ?? CATEGORY_COLORS[0],
  );
  const [isPending, startTransition] = React.useTransition();

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    const trimmedName = name.trim();
    if (!trimmedName) {
      toast.error("Nama kategori wajib diisi");
      return;
    }

    startTransition(async () => {
      const payload = { name: trimmedName, kind, color };
      const res =
        isEditing && initialData
          ? await updateCategory(initialData.id, payload)
          : await createCategory(payload);

      if (!res.ok) {
        toast.error(res.error);
        return;
      }

      toast.success(
        isEditing
          ? "Kategori berhasil diperbarui"
          : "Kategori berhasil ditambahkan",
      );
      onClose();
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-1">
      <div className="flex flex-col gap-1.5">
        <Label
          htmlFor="category-name"
          className="text-xs font-medium text-muted-foreground"
        >
          Nama Kategori
        </Label>
        <Input
          id="category-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Contoh: Donasi"
          maxLength={50}
          required
          disabled={isPending || isDefault}
          autoFocus={!isEditing}
        />
        {isDefault && (
          <p className="text-xs text-muted-foreground">
            Kategori default: nama dan jenis tidak dapat diubah, tetapi warna
            masih bisa disesuaikan.
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label
          htmlFor="category-kind"
          className="text-xs font-medium text-muted-foreground"
        >
          Jenis
        </Label>
        <select
          id="category-kind"
          value={kind}
          onChange={(event) => setKind(event.target.value as CategoryKind)}
          disabled={isPending || isEditing}
          className="flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50 dark:bg-input/30"
        >
          {CATEGORY_KIND_ORDER.map((option) => (
            <option key={option} value={option} className="dark:bg-slate-900">
              {CATEGORY_KIND_LABELS[option]}
            </option>
          ))}
        </select>
        <p className="text-xs text-muted-foreground">
          {isEditing
            ? "Jenis kategori tidak dapat diubah saat mengedit."
            : CATEGORY_KIND_DESCRIPTIONS[kind]}
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <Label className="text-xs font-medium text-muted-foreground">
          Warna
        </Label>
        <div className="flex flex-wrap gap-2">
          {CATEGORY_COLORS.map((option) => (
            <button
              key={option}
              type="button"
              aria-label={`Pilih warna ${option}`}
              aria-pressed={color === option}
              disabled={isPending}
              onClick={() => setColor(option)}
              className={cn(
                "size-7 rounded-full ring-offset-2 ring-offset-background transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50",
                color === option && "ring-2 ring-ring",
              )}
              style={{ backgroundColor: option }}
            />
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2 rounded-lg border bg-muted/30 px-3 py-2.5">
        <span
          className="size-3 shrink-0 rounded-full"
          style={{ backgroundColor: color }}
        />
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-foreground">
            {name.trim() || "Pratinjau kategori"}
          </p>
          <p className="text-xs text-muted-foreground">
            {CATEGORY_KIND_LABELS[kind]}
          </p>
        </div>
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
          {isEditing ? "Simpan Perubahan" : "Simpan Kategori"}
        </Button>
      </DialogFooter>
    </form>
  );
}

export function CategoryDialog({
  open,
  onOpenChange,
  initialData,
  defaultKind = "expense",
}: CategoryDialogProps) {
  const isEditing = Boolean(initialData);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Kategori" : "Tambah Kategori"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Perbarui nama dan warna kategori."
              : "Buat kategori baru untuk merapikan pencatatan keuangan Anda."}
          </DialogDescription>
        </DialogHeader>

        {open && (
          <CategoryFormContent
            key={initialData?.id ?? `new-${defaultKind}`}
            initialData={initialData}
            defaultKind={defaultKind}
            onClose={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
