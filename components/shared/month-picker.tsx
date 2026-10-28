"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { addMonths, parseISO, format } from "date-fns";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { bulanIni, namaBulan, rentangBulan } from "@/lib/format";
import { cn } from "@/lib/utils";

interface MonthPickerProps {
  className?: string;
}

const MONTH_PATTERN = /^\d{4}-\d{2}$/;

export function MonthPicker({ className }: MonthPickerProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentMonth = bulanIni();
  const monthParam = searchParams.get("month") ?? "";
  const selectedMonth = MONTH_PATTERN.test(monthParam)
    ? monthParam
    : currentMonth;

  const options = React.useMemo(() => {
    const months = rentangBulan(currentMonth, 12).reverse();
    if (!months.includes(selectedMonth)) months.unshift(selectedMonth);
    return months;
  }, [currentMonth, selectedMonth]);

  const setMonth = React.useCallback(
    (month: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("page");
      if (month === currentMonth) {
        params.delete("month");
      } else {
        params.set("month", month);
      }
      const query = params.toString();
      router.push(query ? `${pathname}?${query}` : pathname);
    },
    [currentMonth, pathname, router, searchParams],
  );

  const shiftMonth = (offset: number) => {
    const next = format(
      addMonths(parseISO(`${selectedMonth}-01`), offset),
      "yyyy-MM",
    );
    setMonth(next);
  };

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <Button
        type="button"
        variant="outline"
        size="icon-sm"
        aria-label="Bulan sebelumnya"
        onClick={() => shiftMonth(-1)}
      >
        <ChevronLeftIcon />
      </Button>

      <select
        aria-label="Pilih bulan"
        value={selectedMonth}
        onChange={(event) => setMonth(event.target.value)}
        className="flex h-8 min-w-[150px] rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
      >
        {options.map((month) => (
          <option key={month} value={month} className="dark:bg-slate-900">
            {namaBulan(month)}
          </option>
        ))}
      </select>

      <Button
        type="button"
        variant="outline"
        size="icon-sm"
        aria-label="Bulan berikutnya"
        onClick={() => shiftMonth(1)}
      >
        <ChevronRightIcon />
      </Button>
    </div>
  );
}
