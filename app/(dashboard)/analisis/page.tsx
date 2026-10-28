import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { listBudgetsBetween, listTransactionsSince } from "@/lib/data";
import {
  ANALYTICS_RANGES,
  buildAnalyticsSnapshot,
  parseAnalyticsRange,
  type AnalyticsRange,
  type AnalyticsSnapshot,
} from "@/lib/analytics";
import { akhirBulan, awalBulan, bulanIni, rentangBulan } from "@/lib/format";
import { AnalisisClient } from "@/components/analytics/analisis-client";

export const metadata: Metadata = {
  title: "Analisis",
  description: "Lihat tren, distribusi kategori, dan kesehatan anggaran Anda.",
};

interface AnalisisPageProps {
  searchParams: Promise<{ range?: string }>;
}

export default async function AnalisisPage({
  searchParams,
}: AnalisisPageProps) {
  const params = await searchParams;
  const initialRange = parseAnalyticsRange(params.range);
  const currentMonth = bulanIni();

  // Fetch the widest range once and derive every snapshot from it, so
  // switching ranges is a client-side operation with no extra round trip.
  const widestMonths = rentangBulan(
    currentMonth,
    Math.max(...ANALYTICS_RANGES),
  );
  const fromMonth = widestMonths[0];

  const supabase = await createClient();
  const [transactions, budgets] = await Promise.all([
    listTransactionsSince(
      supabase,
      awalBulan(fromMonth),
      akhirBulan(currentMonth),
    ),
    listBudgetsBetween(supabase, fromMonth, currentMonth),
  ]);

  const snapshots = Object.fromEntries(
    ANALYTICS_RANGES.map((range) => [
      range,
      buildAnalyticsSnapshot(transactions, budgets, currentMonth, range),
    ]),
  ) as Record<AnalyticsRange, AnalyticsSnapshot>;

  return (
    <AnalisisClient initialRange={initialRange} snapshots={snapshots} />
  );
}
