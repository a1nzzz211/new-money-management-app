import type { Metadata } from "next";
import { ComingSoon } from "@/components/shared/coming-soon";

export const metadata: Metadata = {
  title: "Kategori",
  description: "Kelola kategori pemasukan, pengeluaran, dan tabungan.",
};

export default function KategoriPage() {
  return (
    <ComingSoon
      title="Kategori"
      description="Kelola kategori pemasukan, pengeluaran, dan tabungan."
    />
  );
}
