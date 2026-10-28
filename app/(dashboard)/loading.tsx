export default function DashboardSectionLoading() {
  return (
    <div
      aria-label="Memuat halaman"
      className="flex animate-pulse flex-col gap-6"
    >
      <div className="space-y-2">
        <div className="h-8 w-48 rounded-md bg-muted" />
        <div className="h-4 w-80 max-w-full rounded-md bg-muted" />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-[86px] rounded-xl bg-card ring-1 ring-foreground/10"
          />
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-7">
        <div className="h-[320px] rounded-xl bg-card ring-1 ring-foreground/10 lg:col-span-4" />
        <div className="h-[320px] rounded-xl bg-card ring-1 ring-foreground/10 lg:col-span-3" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="h-[180px] rounded-xl bg-card ring-1 ring-foreground/10"
          />
        ))}
      </div>
    </div>
  );
}
