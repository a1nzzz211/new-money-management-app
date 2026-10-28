import type { Metadata } from "next";
import { ComingSoon } from "@/components/shared/coming-soon";

export const metadata: Metadata = {
  title: "Histori",
  description: "Telusuri seluruh transaksi dan ekspor data ke CSV.",
};

export default function HistoriPage() {
  return (
    <ComingSoon
      title="Histori"
      description="Telusuri seluruh transaksi dan ekspor data ke CSV."
    />
  );
}
