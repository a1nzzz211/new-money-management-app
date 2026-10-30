import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { listTransactions } from "@/lib/data";
import { tanggalValid } from "@/lib/format";
import { DateRangeFilter } from "@/components/history/date-range-filter";
import { ExportCsvButton } from "@/components/history/export-csv-button";
import { ExportXlsxButton } from "@/components/history/export-xlsx-button";
import { HistoryTable } from "@/components/history/history-table";

export const metadata: Metadata = {
  title: "Histori",
  description: "Telusuri seluruh transaksi dan ekspor data ke CSV.",
};

const PAGE_SIZE = 25;

interface HistoriPageProps {
  searchParams: Promise<{
    from?: string;
    to?: string;
    page?: string;
    sort?: string;
    dir?: string;
  }>;
}

export default async function HistoriPage({ searchParams }: HistoriPageProps) {
  const params = await searchParams;

  let from = tanggalValid(params.from) ?? undefined;
  let to = tanggalValid(params.to) ?? undefined;

  if (from && to && from > to) {
    [from, to] = [to, from];
  }

  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);
  const sort = params.sort === "amount" ? "amount" : "date";
  const dir = params.dir === "asc" ? "asc" : "desc";

  const supabase = await createClient();
  const { rows, count } = await listTransactions(supabase, {
    from,
    to,
    page: page - 1,
    pageSize: PAGE_SIZE,
    sort,
    dir,
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Histori
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Telusuri seluruh transaksi dan ekspor data ke CSV.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <ExportCsvButton from={from} to={to} disabled={count === 0} />
          <ExportXlsxButton from={from} to={to} disabled={count === 0} />
        </div>
      </div>

      <DateRangeFilter from={from ?? ""} to={to ?? ""} />

      <HistoryTable
        transactions={rows}
        totalCount={count}
        currentPage={page}
        pageSize={PAGE_SIZE}
        sort={sort}
        dir={dir}
      />
    </div>
  );
}
