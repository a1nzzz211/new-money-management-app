"use client";

import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";
import {
  namaBulanPendek,
  rupiah,
  rupiahShort,
  tanggalPendek,
} from "@/lib/format";
import type { MonthTotals, TrendGranularity } from "@/lib/analytics";

interface MonthlyTrendChartProps {
  data: MonthTotals[];
  range: number;
  granularity: TrendGranularity;
}

export function MonthlyTrendChart({
  data,
  range,
  granularity,
}: MonthlyTrendChartProps) {
  const isDaily = granularity === "day";
  const hasData =
    data.length > 0 &&
    data.some((d) => d.income > 0 || d.expense > 0 || d.savings > 0);

  if (!hasData) {
    return (
      <div className="flex h-[320px] w-full items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
        Belum ada data transaksi dalam {range} bulan terakhir.
      </div>
    );
  }

  const chartData = data.map((d) => ({
    name: isDaily ? tanggalPendek(d.month) : namaBulanPendek(d.month),
    Pemasukan: d.income,
    Pengeluaran: d.expense,
    Tabungan: d.savings,
    "Saldo Bersih": d.net,
  }));

  return (
    <div className="h-[320px] w-full pt-2">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={chartData}
          margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            className="stroke-muted/40"
          />
          <XAxis
            dataKey="name"
            tickLine={false}
            axisLine={false}
            minTickGap={isDaily ? 24 : 4}
            tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tickFormatter={(value: number) => rupiahShort(value)}
            tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
          />
          <Tooltip
            formatter={(value: unknown) => [rupiah(Number(value)), ""]}
            contentStyle={{
              backgroundColor: "#ffffff",
              borderColor: "var(--border)",
              borderRadius: "0.5rem",
              fontSize: "0.875rem",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.12)",
              color: "#0f172a",
            }}
            labelStyle={{ color: "#0f172a", fontWeight: 600 }}
          />
          <Legend
            verticalAlign="top"
            align="right"
            wrapperStyle={{ paddingBottom: "16px", fontSize: "12px" }}
          />
          <Bar
            dataKey="Pemasukan"
            fill="#10b981"
            radius={[4, 4, 0, 0]}
            maxBarSize={isDaily ? 14 : 32}
            isAnimationActive={false}
          />
          <Bar
            dataKey="Pengeluaran"
            fill="#ef4444"
            radius={[4, 4, 0, 0]}
            maxBarSize={isDaily ? 14 : 32}
            isAnimationActive={false}
          />
          <Line
            type="monotone"
            dataKey="Tabungan"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={isDaily ? false : { r: 3 }}
            activeDot={isDaily ? false : { r: 5 }}
            isAnimationActive={false}
          />
          <Line
            type="monotone"
            dataKey="Saldo Bersih"
            stroke="#8b5cf6"
            strokeWidth={2}
            strokeDasharray="5 4"
            dot={false}
            isAnimationActive={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
