export default function DashboardLoading() {
  return (
    <div
      aria-label="Memuat dashboard"
      className="flex animate-pulse flex-col gap-6"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <div className="h-8 w-48 rounded-md bg-muted" />
          <div className="h-4 w-80 max-w-full rounded-md bg-muted" />
        </div>
        <div className="h-8 w-36 rounded-lg bg-muted" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-[118px] rounded-xl bg-card ring-1 ring-foreground/10"
          />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-7">
        <div className="h-[390px] rounded-xl bg-card ring-1 ring-foreground/10 lg:col-span-4" />
        <div className="h-[390px] rounded-xl bg-card ring-1 ring-foreground/10 lg:col-span-3" />
      </div>

      <div className="grid gap-6 lg:grid-cols-7">
        <div className="h-[330px] rounded-xl bg-card ring-1 ring-foreground/10 lg:col-span-4" />
        <div className="flex flex-col gap-6 lg:col-span-3">
          <div className="h-[180px] rounded-xl bg-card ring-1 ring-foreground/10" />
          <div className="h-[180px] rounded-xl bg-card ring-1 ring-foreground/10" />
        </div>
      </div>
    </div>
  );
}
