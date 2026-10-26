"use client";

import * as React from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { Category } from "@/lib/types";
import { rentangBulan, namaBulan, bulanIni } from "@/lib/format";
import { SearchIcon, XIcon } from "lucide-react";

interface TransactionFiltersProps {
  categories: Category[];
}

export function TransactionFilters({ categories }: TransactionFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentMonth = searchParams.get("month") || "";
  const currentType = searchParams.get("type") || "";
  const currentCategory = searchParams.get("categoryId") || "";
  const currentSearch = searchParams.get("search") || "";

  const updateFilters = React.useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());

      // Reset page to 1 on filter change
      params.delete("page");

      for (const [key, value] of Object.entries(updates)) {
        if (!value) {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      }

      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams]
  );

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const search = formData.get("search")?.toString().trim();
    updateFilters({ search: search || null });
  };

  const handleClearFilters = () => {
    router.push(pathname);
  };

  const hasActiveFilters = Boolean(
    currentMonth || currentType || currentCategory || currentSearch
  );

  // Month options for the past 12 months
  const monthOptions = React.useMemo(() => {
    return rentangBulan(bulanIni(), 12).reverse();
  }, []);

  // Filter category dropdown based on currentType if selected
  const availableCategories = React.useMemo(() => {
    if (!currentType) return categories;
    return categories.filter((c) => c.kind === currentType);
  }, [categories, currentType]);

  return (
    <div className="flex flex-col gap-3 rounded-xl border bg-card p-3.5 shadow-xs">
      <div className="flex flex-wrap items-center gap-2">
        {/* Search */}
        <form
          key={currentSearch}
          onSubmit={handleSearchSubmit}
          className="relative min-w-[200px] flex-1 sm:max-w-xs"
        >
          <SearchIcon className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            name="search"
            type="text"
            placeholder="Cari transaksi (tekan Enter)..."
            defaultValue={currentSearch}
            className="pl-8 text-xs"
          />
        </form>

        {/* Month Filter */}
        <div className="min-w-[130px]">
          <select
            value={currentMonth}
            onChange={(e) => updateFilters({ month: e.target.value || null })}
            className="flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-xs outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
          >
            <option value="" className="dark:bg-slate-900">
              Semua Periode
            </option>
            {monthOptions.map((m) => (
              <option key={m} value={m} className="dark:bg-slate-900">
                {namaBulan(m)}
              </option>
            ))}
          </select>
        </div>

        {/* Type Filter */}
        <div className="min-w-[120px]">
          <select
            value={currentType}
            onChange={(e) => {
              const newType = e.target.value || null;
              // Reset category if it doesn't match new type
              updateFilters({ type: newType, categoryId: null });
            }}
            className="flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-xs outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
          >
            <option value="" className="dark:bg-slate-900">
              Semua Jenis
            </option>
            <option value="expense" className="dark:bg-slate-900">
              Pengeluaran
            </option>
            <option value="income" className="dark:bg-slate-900">
              Pemasukan
            </option>
            <option value="savings" className="dark:bg-slate-900">
              Tabungan
            </option>
          </select>
        </div>

        {/* Category Filter */}
        <div className="min-w-[140px]">
          <select
            value={currentCategory}
            onChange={(e) =>
              updateFilters({ categoryId: e.target.value || null })
            }
            className="flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-xs outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
          >
            <option value="" className="dark:bg-slate-900">
              Semua Kategori
            </option>
            {availableCategories.map((cat) => (
              <option key={cat.id} value={cat.id} className="dark:bg-slate-900">
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClearFilters}
            className="h-8 gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <XIcon className="size-3.5" />
            Reset Filter
          </Button>
        )}
      </div>
    </div>
  );
}

