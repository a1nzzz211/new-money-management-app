export default function TabunganLoading() {
  return (
    <div
      aria-label="Memuat target tabungan"
      className="flex animate-pulse flex-col gap-6"
    >
      <div className="space-y-2">
        <div className="h-8 w-40 rounded-md bg-muted" />
        <div className="h-4 w-80 rounded-md bg-muted" />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="h-[86px] rounded-xl bg-card ring-1 ring-foreground/10"
          />
        ))}
      </div>

      <div className="h-10 w-full rounded-lg bg-card ring-1 ring-foreground/10" />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="h-[240px] rounded-xl bg-card ring-1 ring-foreground/10"
          />
        ))}
      </div>
    </div>
  );
}
