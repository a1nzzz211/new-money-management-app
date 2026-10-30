"use client";

import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "cn";
import { FileSpreadsheetIcon } from "lucide-react";

interface ExportXlsxButtonProps {
  from?: string;
  to?: string;
  disabled?: boolean;
}

export function ExportXlsxButton({ from, to, disabled }: ExportXlsxButtonProps) {
  const params = new URLSearchParams();
  if (from) params.set("from", from);
  if (to) params.set("to", to);

  const query = params.toString();
  const href = `/api/export/xlsx${query ? `?${query}` : ""}`;

  if (disabled) {
    return (
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled
        className="gap-1.5"
      >
        <FileSpreadsheetIcon className="size-4" />
        Ekspor XLSX
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
      <FileSpreadsheetIcon className="size-4" />
      Ekspor XLSX
    </a>
  );
}
