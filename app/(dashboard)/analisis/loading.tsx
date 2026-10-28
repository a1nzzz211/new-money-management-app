export default function AnalisisLoading() {
  return (
    <div
      aria-label="Memuat analisis"
      className="flex animate-pulse flex-col gap-6"
    >
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
        <div className="space-y-2">
          <div className="h-8 w-40 rounded-md bg-muted" />
          <div className="h-4 w-72 rounded-md bg-muted" />
        </div>
        <div className="h-9 w-64 rounded-lg bg-muted" />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-[86px] rounded-xl bg-card ring-1 ring-foreground/10"
          />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-7">
        <div className="h-[420px] rounded-xl bg-card ring-1 ring-foreground/10 lg:col-span-4" />
        <div className="h-[420px] rounded-xl bg-card ring-1 ring-foreground/10 lg:col-span-3" />
      </div>

      <div className="h-[150px] rounded-xl bg-card ring-1 ring-foreground/10" />
    </div>
  );
}
