import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import {
  getTransactionTotals,
  listTransactions,
  listCategories,
} from "@/lib/data";
import { bulanValid } from "@/lib/format";
import { TransactionStats } from "@/components/transactions/transaction-stats";
import { TransactionFilters } from "@/components/transactions/transaction-filters";
import { TransactionTable } from "@/components/transactions/transaction-table";
import type { TransactionType } from "@/lib/types";

export const metadata: Metadata = {
  title: "Transaksi",
  description: "Kelola riwayat pengeluaran, pemasukan, dan tabungan Anda.",
};

const PAGE_SIZE = 20;

interface TransaksiPageProps {
  searchParams: Promise<{
    month?: string;
    type?: string;
    categoryId?: string;
    search?: string;
    page?: string;
  }>;
}

export default async function TransaksiPage({ searchParams }: TransaksiPageProps) {
  const params = await searchParams;

  const validTypes: TransactionType[] = ["income", "expense", "savings"];
  const typeFilter = validTypes.includes(params.type as TransactionType)
    ? (params.type as TransactionType)
    : undefined;

  const requestedPage = Math.max(1, parseInt(params.page ?? "1", 10) || 1);

  // Ignore invalid `month` values instead of passing them to date helpers.
  const filters = {
    month: bulanValid(params.month) ?? undefined,
    type: typeFilter,
    categoryId: params.categoryId || undefined,
    search: params.search || undefined,
  };

  const supabase = await createClient();

  // Fetch categories, the visible page, and full-range totals in parallel.
  const [categories, pageResult, totals] = await Promise.all([
    listCategories(supabase),
    listTransactions(supabase, {
      ...filters,
      page: requestedPage - 1,
      pageSize: PAGE_SIZE,
    }),
    getTransactionTotals(supabase, filters),
  ]);

  // If the requested page is past the end (e.g. after deleting rows), land on
  // the last valid page instead of showing a misleading empty state.
  let { rows: transactions, count: totalCount } = pageResult;
  let page = requestedPage;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  if (transactions.length === 0 && totalCount > 0 && page > totalPages) {
    page = totalPages;
    ({ rows: transactions, count: totalCount } = await listTransactions(
      supabase,
      { ...filters, page: page - 1, pageSize: PAGE_SIZE },
    ));
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Transaksi
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Catat, pantau, dan kelola semua arus kas keuangan Anda.
        </p>
      </div>

      {/* Summary Stats */}
      <TransactionStats {...totals} />

      {/* Filter Bar */}
      <TransactionFilters categories={categories} />

      {/* Transaction Table and Actions */}
      <TransactionTable
        transactions={transactions}
        categories={categories}
        totalCount={totalCount}
        currentPage={page}
        pageSize={PAGE_SIZE}
      />
    </div>
  );
}

