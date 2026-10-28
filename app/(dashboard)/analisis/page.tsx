import type { Metadata } from "next";
import { ComingSoon } from "@/components/shared/coming-soon";

export const metadata: Metadata = {
  title: "Analisis",
  description: "Lihat tren, distribusi kategori, dan kesehatan anggaran Anda.",
};

export default function AnalisisPage() {
  return (
    <ComingSoon
      title="Analisis"
      description="Lihat tren, distribusi kategori, dan kesehatan anggaran Anda."
    />
  );
}
