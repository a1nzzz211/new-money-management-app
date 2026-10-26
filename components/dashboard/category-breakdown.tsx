import { rupiah } from "@/lib/format";
import type { CategorySlice } from "@/lib/analytics";

interface CategoryBreakdownProps {
  categories: CategorySlice[];
}

export function CategoryBreakdown({ categories }: CategoryBreakdownProps) {
  if (!categories || categories.length === 0) {
    return (
      <div className="flex h-[240px] w-full items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
        Belum ada pengeluaran pada bulan ini.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {categories.slice(0, 5).map((cat) => {
        const pct = Math.round(cat.share * 100);
        return (
          <div key={cat.categoryId} className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span
                  className="size-3 rounded-full shrink-0"
                  style={{ backgroundColor: cat.color }}
                />
                <span className="font-medium text-foreground">{cat.name}</span>
                <span className="text-xs text-muted-foreground">
                  ({cat.count}x)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-foreground">
                  {rupiah(cat.total)}
                </span>
                <span className="text-xs text-muted-foreground w-9 text-right font-medium">
                  {pct}%
                </span>
              </div>
            </div>
            {/* Progress track */}
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${Math.min(pct, 100)}%`,
                  backgroundColor: cat.color,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
