"use client";

import * as React from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CalendarRangeIcon, XIcon } from "lucide-react";

interface DateRangeFilterProps {
  from: string;
  to: string;
}

export function DateRangeFilter({ from, to }: DateRangeFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [error, setError] = React.useState<string | null>(null);
  const hasRange = Boolean(from || to);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const nextFrom = formData.get("from")?.toString() ?? "";
    const nextTo = formData.get("to")?.toString() ?? "";

    if (nextFrom && nextTo && nextFrom > nextTo) {
      setError("Tanggal awal tidak boleh melebihi tanggal akhir");
      return;
    }

    setError(null);

    const params = new URLSearchParams(searchParams.toString());
    params.delete("page");

    if (nextFrom) params.set("from", nextFrom);
    else params.delete("from");

    if (nextTo) params.set("to", nextTo);
    else params.delete("to");

    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  };

  const handleReset = () => {
    setError(null);

    const params = new URLSearchParams(searchParams.toString());
    params.delete("from");
    params.delete("to");
    params.delete("page");

    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  };

  return (
    <div className="flex flex-col gap-2 rounded-xl border bg-card p-3.5 shadow-xs">
      <form
        key={`${from}-${to}`}
        onSubmit={handleSubmit}
        className="flex flex-wrap items-end gap-2"
      >
        <div className="flex flex-col gap-1">
          <label
            htmlFor="history-from"
            className="text-[11px] font-medium text-muted-foreground"
          >
            Dari Tanggal
          </label>
          <Input
            id="history-from"
            name="from"
            type="date"
            defaultValue={from}
            max={to || undefined}
            className="h-8 w-[150px] text-xs"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label
            htmlFor="history-to"
            className="text-[11px] font-medium text-muted-foreground"
          >
            Sampai Tanggal
          </label>
          <Input
            id="history-to"
            name="to"
            type="date"
            defaultValue={to}
            min={from || undefined}
            className="h-8 w-[150px] text-xs"
          />
        </div>

        <Button type="submit" size="sm" className="h-8 gap-1.5">
          <CalendarRangeIcon className="size-3.5" />
          Terapkan
        </Button>

        {hasRange && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="h-8 gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <XIcon className="size-3.5" />
            Reset
          </Button>
        )}
      </form>

      {error && (
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
