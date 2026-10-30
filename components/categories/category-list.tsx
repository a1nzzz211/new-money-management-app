"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CategoryDialog } from "@/components/categories/category-dialog";
import { DeleteCategoryDialog } from "@/components/categories/delete-category-dialog";
import {
  CATEGORY_KIND_DESCRIPTIONS,
  CATEGORY_KIND_LABELS,
  CATEGORY_KIND_ORDER,
} from "@/lib/category-labels";
import type { Category, CategoryKind } from "@/lib/types";
import {
  PencilIcon,
  PlusIcon,
  ShieldCheckIcon,
  TagIcon,
  Trash2Icon,
} from "lucide-react";

interface CategoryListProps {
  categories: Category[];
  usageCounts: Record<string, number>;
}

export function CategoryList({ categories, usageCounts }: CategoryListProps) {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [addKind, setAddKind] = React.useState<CategoryKind>("expense");
  const [editingCategory, setEditingCategory] =
    React.useState<Category | null>(null);
  const [deletingCategory, setDeletingCategory] =
    React.useState<Category | null>(null);

  const grouped = React.useMemo(() => {
    return CATEGORY_KIND_ORDER.map((kind) => ({
      kind,
      items: categories.filter((category) => category.kind === kind),
    }));
  }, [categories]);

  const openAdd = (kind: CategoryKind) => {
    setEditingCategory(null);
    setAddKind(kind);
    setDialogOpen(true);
  };

  const openEdit = (category: Category) => {
    setEditingCategory(category);
    setAddKind(category.kind);
    setDialogOpen(true);
  };

  return (
    <>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <p className="text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">
              {categories.length}
            </span>{" "}
            kategori tersedia
          </p>
          <Button
            onClick={() => openAdd("expense")}
            size="sm"
            className="gap-1.5 self-start sm:self-auto"
          >
            <PlusIcon className="size-4" />
            Tambah Kategori
          </Button>
        </div>

        {grouped.map(({ kind, items }) => (
          <section key={kind} className="flex flex-col gap-2">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-heading text-base font-semibold text-foreground">
                  {CATEGORY_KIND_LABELS[kind]}
                </h2>
                <p className="text-xs text-muted-foreground">
                  {CATEGORY_KIND_DESCRIPTIONS[kind]}
                </p>
              </div>
              <Badge variant="secondary" className="shrink-0 text-[11px]">
                {items.length} kategori
              </Badge>
            </div>

            <div className="overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-2 p-6 text-center">
                  <div className="flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
                    <TagIcon className="size-5" />
                  </div>
                  <p className="text-sm font-medium text-foreground">
                    Belum ada kategori {CATEGORY_KIND_LABELS[kind].toLowerCase()}
                  </p>
                  <p className="max-w-sm text-xs text-muted-foreground">
                    Tambahkan kategori agar pencatatan lebih rapi.
                  </p>
                  <Button
                    onClick={() => openAdd(kind)}
                    size="sm"
                    variant="outline"
                    className="mt-1 gap-1.5"
                  >
                    <PlusIcon className="size-4" />
                    Tambah Kategori
                  </Button>
                </div>
              ) : (
                <ul className="divide-y divide-border">
                  {items.map((category) => {
                    const usage = usageCounts[category.id] ?? 0;

                    return (
                      <li
                        key={category.id}
                        className="flex items-center justify-between gap-3 p-3 transition-colors hover:bg-muted/30"
                      >
                        <div className="flex min-w-0 items-center gap-2.5">
                          <span
                            className="size-3 shrink-0 rounded-full"
                            style={{ backgroundColor: category.color }}
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <p className="truncate text-sm font-medium text-foreground">
                                {category.name}
                              </p>
                              {category.is_default && (
                                <Badge
                                  variant="secondary"
                                  className="gap-1 border-transparent bg-muted text-[10px] text-muted-foreground"
                                >
                                  <ShieldCheckIcon className="size-3" />
                                  Default
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {usage} transaksi
                            </p>
                          </div>
                        </div>

                        <div className="flex shrink-0 items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            onClick={() => openEdit(category)}
                            title="Edit Kategori"
                            className="text-muted-foreground hover:text-foreground"
                          >
                            <PencilIcon className="size-3.5" />
                            <span className="sr-only">Edit</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            onClick={() => setDeletingCategory(category)}
                            disabled={category.is_default}
                            title={
                              category.is_default
                                ? "Kategori default tidak dapat dihapus"
                                : "Hapus Kategori"
                            }
                            className="text-muted-foreground hover:text-destructive"
                          >
                            <Trash2Icon className="size-3.5" />
                            <span className="sr-only">Hapus</span>
                          </Button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </section>
        ))}
      </div>

      <CategoryDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initialData={editingCategory}
        defaultKind={addKind}
      />

      <DeleteCategoryDialog
        open={Boolean(deletingCategory)}
        onOpenChange={(open) => {
          if (!open) setDeletingCategory(null);
        }}
        category={deletingCategory}
        usageCount={
          deletingCategory ? (usageCounts[deletingCategory.id] ?? 0) : 0
        }
      />
    </>
  );
}
