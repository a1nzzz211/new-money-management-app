"use client";

import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "cn";
import { DownloadIcon } from "lucide-react";

interface ExportCsvButtonProps {
  from?: string;
  to?: string;
  disabled?: boolean;
}

export function ExportCsvButton({ from, to, disabled }: ExportCsvButtonProps) {
  const params = new URLSearchParams();
  if (from) params.set("from", from);
  if (to) params.set("to", to);

  const query = params.toString();
  const href = `/api/export${query ? `?${query}` : ""}`;

  if (disabled) {
    return (
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled
        className="gap-1.5"
      >
        <DownloadIcon className="size-4" />
        Ekspor CSV
      </Button>
    );
  }

  return (
    <a
      href={href}
      download
      className={cn(
        buttonVariants({ variant: "outline", size: "sm" }),
        "gap-1.5",
      )}
    >
      <DownloadIcon className="size-4" />
      Ekspor CSV
    </a>
  );
}
