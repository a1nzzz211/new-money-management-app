export default function HistoriLoading() {
  return (
    <div
      aria-label="Memuat histori"
      className="flex animate-pulse flex-col gap-6"
    >
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
        <div className="space-y-2">
          <div className="h-8 w-40 rounded-md bg-muted" />
          <div className="h-4 w-80 max-w-full rounded-md bg-muted" />
        </div>
        <div className="h-8 w-28 rounded-lg bg-muted" />
      </div>

      <div className="h-[58px] rounded-xl bg-card ring-1 ring-foreground/10" />

      <div className="flex flex-col gap-4">
        <div className="h-4 w-44 rounded-md bg-muted" />

        <div className="overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10">
          <div className="h-10 border-b bg-muted/40" />
          {Array.from({ length: 8 }).map((_, index) => (
            <div
              key={index}
              className="h-[58px] border-b bg-card last:border-b-0"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
