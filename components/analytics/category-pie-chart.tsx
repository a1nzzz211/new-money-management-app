"use client";

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts";
import { rupiah } from "@/lib/format";
import type { CategorySlice } from "@/lib/analytics";

interface CategoryPieChartProps {
  data: CategorySlice[];
}

export function CategoryPieChart({ data }: CategoryPieChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-[260px] w-full items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
        Belum ada pengeluaran pada rentang ini.
      </div>
    );
  }

  const total = data.reduce((sum, slice) => sum + slice.total, 0);

  return (
    <div className="flex flex-col gap-2">
      <div className="h-[240px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="total"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={58}
              outerRadius={92}
              paddingAngle={2}
              strokeWidth={0}
              isAnimationActive={false}
            >
              {data.map((slice) => (
                <Cell key={slice.categoryId} fill={slice.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: unknown, name: unknown) => {
                const amount = Number(value);
                const pct = total > 0 ? (amount / total) * 100 : 0;
                return [
                  `${rupiah(amount)} (${pct.toFixed(1)}%)`,
                  String(name),
                ];
              }}
              contentStyle={{
                backgroundColor: "#ffffff",
                borderColor: "var(--border)",
                borderRadius: "0.5rem",
                fontSize: "0.875rem",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.12)",
                color: "#0f172a",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <ul className="flex max-h-[168px] flex-col gap-2 overflow-y-auto pr-1">
        {data.map((slice) => {
          const pct = total > 0 ? (slice.total / total) * 100 : 0;
          return (
            <li
              key={slice.categoryId}
              className="flex items-center justify-between gap-3 text-xs"
            >
              <div className="flex min-w-0 items-center gap-2">
                <span
                  className="size-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: slice.color }}
                />
                <span className="truncate font-medium text-foreground">
                  {slice.name}
                </span>
              </div>
              <div className="flex shrink-0 items-center gap-2 tabular-nums">
                <span className="text-muted-foreground">
                  {pct.toFixed(1)}%
                </span>
                <span className="font-medium text-foreground">
                  {rupiah(slice.total)}
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
