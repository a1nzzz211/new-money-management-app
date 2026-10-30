export default function KategoriLoading() {
  return (
    <div
      aria-label="Memuat kategori"
      className="flex animate-pulse flex-col gap-6"
    >
      <div className="space-y-2">
        <div className="h-8 w-40 rounded-md bg-muted" />
        <div className="h-4 w-80 max-w-full rounded-md bg-muted" />
      </div>

      {Array.from({ length: 3 }).map((_, group) => (
        <div key={group} className="flex flex-col gap-2">
          <div className="h-4 w-32 rounded-md bg-muted" />
          <div className="overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10">
            {Array.from({ length: 4 }).map((_, row) => (
              <div
                key={row}
                className="h-14 border-b border-border/60 last:border-b-0"
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
