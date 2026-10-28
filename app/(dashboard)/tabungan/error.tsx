"use client";

import { Button } from "@/components/ui/button";
import { AlertTriangleIcon } from "lucide-react";

export default function TabunganError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center gap-3 rounded-xl border border-dashed bg-card/50 p-8 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <AlertTriangleIcon className="size-6" />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium text-foreground">
          Gagal memuat target tabungan
        </p>
        <p className="max-w-sm text-xs text-muted-foreground">
          Terjadi kesalahan saat mengambil data target. Silakan coba lagi.
        </p>
      </div>
      <Button type="button" size="sm" onClick={reset} className="mt-2">
        Coba Lagi
      </Button>
    </div>
  );
}
