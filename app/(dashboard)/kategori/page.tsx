import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getCategoryUsageCounts, listCategories } from "@/lib/data";
import { CategoryList } from "@/components/categories/category-list";

export const metadata: Metadata = {
  title: "Kategori",
  description: "Kelola kategori pemasukan, pengeluaran, dan tabungan.",
};

export default async function KategoriPage() {
  const supabase = await createClient();

  const categories = await listCategories(supabase);
  const usageCounts = await getCategoryUsageCounts(
    supabase,
    categories.map((category) => category.id),
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Kategori
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Kelola kategori pemasukan, pengeluaran, dan tabungan. Kategori default
          tidak dapat dihapus atau diganti namanya.
        </p>
      </div>

      <CategoryList categories={categories} usageCounts={usageCounts} />
    </div>
  );
}
