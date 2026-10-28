"use client";

import {
  ANALYTICS_RANGES,
  type AnalyticsRange,
} from "@/lib/analytics";
import { cn } from "@/lib/utils";

const RANGE_LABELS: Record<AnalyticsRange, string> = {
  1: "1 Bulan",
  3: "3 Bulan",
  6: "6 Bulan",
  12: "12 Bulan",
};

interface TimeframeSelectorProps {
  value: AnalyticsRange;
  onChange: (range: AnalyticsRange) => void;
}

export function TimeframeSelector({ value, onChange }: TimeframeSelectorProps) {
  return (
    <div
      role="group"
      aria-label="Rentang waktu analisis"
      className="inline-flex items-center gap-1 self-start rounded-lg border bg-card p-1"
    >
      {ANALYTICS_RANGES.map((range) => {
        const active = range === value;
        return (
          <button
            key={range}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(range)}
            className={cn(
              "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
              active
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            {RANGE_LABELS[range]}
          </button>
        );
      })}
    </div>
  );
}
