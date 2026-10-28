"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";
import { namaBulanPendek, rupiah, rupiahShort } from "@/lib/format";
import type { MonthTotals } from "@/lib/analytics";

interface TrendChartProps {
  data: MonthTotals[];
}

export function TrendChart({ data }: TrendChartProps) {
  if (
    !data ||
    data.length === 0 ||
    data.every((d) => d.income === 0 && d.expense === 0)
  ) {
    return (
      <div className="flex h-[280px] w-full items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
        Belum ada data transaksi dalam 6 bulan terakhir.
      </div>
    );
  }

  const chartData = data.map((d) => ({
    name: namaBulanPendek(d.month),
    Pemasukan: d.income,
    Pengeluaran: d.expense,
  }));

  return (
    <div className="h-[300px] w-full pt-2">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
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
            tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tickFormatter={(v: number) => rupiahShort(v)}
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
            maxBarSize={36}
          />
          <Bar
            dataKey="Pengeluaran"
            fill="#ef4444"
            radius={[4, 4, 0, 0]}
            maxBarSize={36}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
