"use client";

import * as React from "react";
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
import { TransactionDialog } from "@/components/transactions/transaction-dialog";
import { DeleteTransactionDialog } from "@/components/transactions/delete-transaction-dialog";
import type { Category } from "@/lib/types";
import type { TransactionWithCategory } from "@/lib/data";
import { rupiah, tanggal } from "@/lib/format";
import {
  ArrowDownLeftIcon,
  ArrowUpRightIcon,
  PiggyBankIcon,
  PencilIcon,
  Trash2Icon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusIcon,
  ReceiptIcon,
} from "lucide-react";

interface TransactionTableProps {
  transactions: TransactionWithCategory[];
  categories: Category[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
}

export function TransactionTable({
  transactions,
  categories,
  totalCount,
  currentPage,
  pageSize,
}: TransactionTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingTx, setEditingTx] = React.useState<TransactionWithCategory | null>(
    null
  );
  const [deletingTx, setDeletingTx] = React.useState<TransactionWithCategory | null>(
    null
  );

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(newPage));
    router.push(`${pathname}?${params.toString()}`);
  };

  const openAdd = () => {
    setEditingTx(null);
    setDialogOpen(true);
  };

  const openEdit = (tx: TransactionWithCategory) => {
    setEditingTx(tx);
    setDialogOpen(true);
  };

  const openDelete = (tx: TransactionWithCategory) => {
    setDeletingTx(tx);
  };

  const fromRecord = totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const toRecord = Math.min(currentPage * pageSize, totalCount);

  return (
    <>
      <div className="flex flex-col gap-4">
        {/* Quick Add Bar & Counter */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-xs text-muted-foreground">
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
              <span>Tidak ada transaksi yang cocok</span>
            )}
          </div>

          <Button onClick={openAdd} size="sm" className="gap-1.5 self-start sm:self-auto">
            <PlusIcon className="size-4" />
            Catat Transaksi
          </Button>
        </div>

        {/* Transaction Table / Cards */}
        {transactions.length === 0 ? (
          <div className="flex min-h-[300px] w-full flex-col items-center justify-center gap-3 rounded-xl border border-dashed p-8 text-center bg-card/50">
            <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <ReceiptIcon className="size-6" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">
                Belum ada transaksi
              </p>
              <p className="text-xs text-muted-foreground max-w-sm">
                Catat pengeluaran, pemasukan, atau tabungan pertama Anda untuk mulai mengelola keuangan.
              </p>
            </div>
            <Button onClick={openAdd} size="sm" className="mt-2 gap-1.5">
              <PlusIcon className="size-4" />
              Catat Transaksi Pertama
            </Button>
          </div>
        ) : (
          <div className="rounded-xl border bg-card shadow-xs overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead className="w-[120px] text-xs">Tanggal</TableHead>
                  <TableHead className="text-xs">Deskripsi & Kategori</TableHead>
                  <TableHead className="w-[110px] text-xs">Jenis</TableHead>
                  <TableHead className="w-[150px] text-right text-xs">Nominal</TableHead>
                  <TableHead className="w-[100px] text-right text-xs">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((tx) => {
                  const isIncome = tx.type === "income";
                  const isSavings = tx.type === "savings";

                  return (
                    <TableRow key={tx.id} className="hover:bg-muted/30">
                      {/* Date */}
                      <TableCell className="text-xs text-muted-foreground font-medium">
                        {tanggal(tx.occurred_on)}
                      </TableCell>

                      {/* Description & Category */}
                      <TableCell>
                        <div className="flex flex-col gap-1 max-w-[300px]">
                          <span className="font-medium text-foreground truncate text-sm">
                            {tx.description?.trim() || tx.category?.name || "Tanpa Keterangan"}
                          </span>
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <span
                              className="size-2 rounded-full shrink-0"
                              style={{
                                backgroundColor: tx.category?.color ?? "#94a3b8",
                              }}
                            />
                            <span className="truncate">
                              {tx.category?.name ?? "Tanpa kategori"}
                            </span>
                          </div>
                        </div>
                      </TableCell>

                      {/* Type Badge */}
                      <TableCell>
                        {isIncome ? (
                          <Badge
                            variant="secondary"
                            className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-transparent text-[11px] gap-1 font-medium"
                          >
                            <ArrowDownLeftIcon className="size-3" />
                            Pemasukan
                          </Badge>
                        ) : isSavings ? (
                          <Badge
                            variant="secondary"
                            className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-transparent text-[11px] gap-1 font-medium"
                          >
                            <PiggyBankIcon className="size-3" />
                            Tabungan
                          </Badge>
                        ) : (
                          <Badge
                            variant="secondary"
                            className="bg-red-500/10 text-red-600 dark:text-red-400 border-transparent text-[11px] gap-1 font-medium"
                          >
                            <ArrowUpRightIcon className="size-3" />
                            Pengeluaran
                          </Badge>
                        )}
                      </TableCell>

                      {/* Amount */}
                      <TableCell className="text-right">
                        <span
                          className={`font-semibold tabular-nums text-sm ${
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

                      {/* Actions */}
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            onClick={() => openEdit(tx)}
                            title="Edit Transaksi"
                            className="text-muted-foreground hover:text-foreground"
                          >
                            <PencilIcon className="size-3.5" />
                            <span className="sr-only">Edit</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            onClick={() => openDelete(tx)}
                            title="Hapus Transaksi"
                            className="text-muted-foreground hover:text-destructive"
                          >
                            <Trash2Icon className="size-3.5" />
                            <span className="sr-only">Hapus</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Pagination Bar */}
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

      {/* Add / Edit Dialog */}
      <TransactionDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        categories={categories}
        initialData={editingTx}
      />

      {/* Delete Dialog */}
      <DeleteTransactionDialog
        open={Boolean(deletingTx)}
        onOpenChange={(open) => {
          if (!open) setDeletingTx(null);
        }}
        transaction={deletingTx}
      />
    </>
  );
}

