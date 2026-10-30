"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { TransactionWithCategory } from "@/lib/data";
import { rupiah, tanggal } from "@/lib/format";
import {
  ArrowDownLeftIcon,
  ArrowDownIcon,
  ArrowUpDownIcon,
  ArrowUpIcon,
  ArrowUpRightIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  HistoryIcon,
  PiggyBankIcon,
} from "lucide-react";

type SortColumn = "date" | "amount";

interface HistoryTableProps {
  transactions: TransactionWithCategory[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
  sort: SortColumn;
  dir: "asc" | "desc";
}

export function HistoryTable({
  transactions,
  totalCount,
  currentPage,
  pageSize,
  sort,
  dir,
}: HistoryTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  const handleSort = (column: SortColumn) => {
    const params = new URLSearchParams(searchParams.toString());
    const nextDir = sort === column && dir === "asc" ? "desc" : "asc";

    params.set("sort", column);
    params.set("dir", nextDir);
    params.delete("page");

    router.push(`${pathname}?${params.toString()}`);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;

    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(newPage));
    router.push(`${pathname}?${params.toString()}`);
  };

  const fromRecord = totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const toRecord = Math.min(currentPage * pageSize, totalCount);

  const renderSortIcon = (column: SortColumn) => {
    if (sort !== column) return <ArrowUpDownIcon className="size-3" />;
    return dir === "asc" ? (
      <ArrowUpIcon className="size-3" />
    ) : (
      <ArrowDownIcon className="size-3" />
    );
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">
          {totalCount > 0 ? (
            <span>
              Menampilkan{" "}
              <span className="font-semibold text-foreground">
                {fromRecord}–{toRecord}
              </span>{" "}
              dari{" "}
              <span className="font-semibold text-foreground">
                {totalCount}
              </span>{" "}
              transaksi
            </span>
          ) : (
            <span>Tidak ada transaksi pada rentang tanggal ini</span>
          )}
        </p>
      </div>

      {transactions.length === 0 ? (
        <div className="flex min-h-[300px] w-full flex-col items-center justify-center gap-3 rounded-xl border border-dashed bg-card/50 p-8 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <HistoryIcon className="size-6" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">
              Belum ada transaksi
            </p>
            <p className="max-w-sm text-xs text-muted-foreground">
              Tidak ada transaksi yang cocok dengan rentang tanggal yang dipilih.
              Coba ubah atau reset filter tanggal.
            </p>
          </div>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border bg-card shadow-xs">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead
                  className="w-[120px] text-xs"
                  aria-sort={
                    sort === "date"
                      ? dir === "asc"
                        ? "ascending"
                        : "descending"
                      : "none"
                  }
                >
                  <button
                    type="button"
                    onClick={() => handleSort("date")}
                    className="inline-flex items-center gap-1 font-medium hover:text-foreground"
                  >
                    Tanggal
                    {renderSortIcon("date")}
                  </button>
                </TableHead>
                <TableHead className="w-[110px] text-xs">Jenis</TableHead>
                <TableHead className="text-xs">Kategori</TableHead>
                <TableHead className="text-xs">Catatan</TableHead>
                <TableHead
                  className="w-[150px] text-right text-xs"
                  aria-sort={
                    sort === "amount"
                      ? dir === "asc"
                        ? "ascending"
                        : "descending"
                      : "none"
                  }
                >
                  <button
                    type="button"
                    onClick={() => handleSort("amount")}
                    className="inline-flex items-center gap-1 font-medium hover:text-foreground"
                  >
                    Nominal
                    {renderSortIcon("amount")}
                  </button>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((tx) => {
                const isIncome = tx.type === "income";
                const isSavings = tx.type === "savings";

                return (
                  <TableRow key={tx.id} className="hover:bg-muted/30">
                    <TableCell className="text-xs font-medium text-muted-foreground">
                      {tanggal(tx.occurred_on)}
                    </TableCell>

                    <TableCell>
                      {isIncome ? (
                        <Badge
                          variant="secondary"
                          className="gap-1 border-transparent bg-emerald-500/10 text-[11px] font-medium text-emerald-600 dark:text-emerald-400"
                        >
                          <ArrowDownLeftIcon className="size-3" />
                          Pemasukan
                        </Badge>
                      ) : isSavings ? (
                        <Badge
                          variant="secondary"
                          className="gap-1 border-transparent bg-blue-500/10 text-[11px] font-medium text-blue-600 dark:text-blue-400"
                        >
                          <PiggyBankIcon className="size-3" />
                          Tabungan
                        </Badge>
                      ) : (
                        <Badge
                          variant="secondary"
                          className="gap-1 border-transparent bg-red-500/10 text-[11px] font-medium text-red-600 dark:text-red-400"
                        >
                          <ArrowUpRightIcon className="size-3" />
                          Pengeluaran
                        </Badge>
                      )}
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <span
                          className="size-2 shrink-0 rounded-full"
                          style={{
                            backgroundColor: tx.category?.color ?? "#94a3b8",
                          }}
                        />
                        <span className="truncate">
                          {tx.category?.name ?? "Tanpa kategori"}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <span className="block max-w-[280px] truncate text-sm text-foreground">
                        {tx.description?.trim() || "-"}
                      </span>
                    </TableCell>

                    <TableCell className="text-right">
                      <span
                        className={`text-sm font-semibold tabular-nums ${
                          isIncome
                            ? "text-emerald-600 dark:text-emerald-400"
                            : isSavings
                              ? "text-blue-600 dark:text-blue-400"
                              : "text-foreground"
                        }`}
                      >
                        {isIncome ? "+" : isSavings ? "" : "-"}
                        {rupiah(Number(tx.amount))}
                      </span>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t pt-3">
          <p className="text-xs text-muted-foreground">
            Halaman {currentPage} dari {totalPages}
          </p>
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage <= 1}
              onClick={() => handlePageChange(currentPage - 1)}
              className="gap-1 text-xs"
            >
              <ChevronLeftIcon className="size-3.5" />
              Sebelumnya
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages}
              onClick={() => handlePageChange(currentPage + 1)}
              className="gap-1 text-xs"
            >
              Selanjutnya
              <ChevronRightIcon className="size-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
