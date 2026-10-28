export default function TransaksiLoading() {
  return (
    <div
      aria-label="Memuat transaksi"
      className="flex animate-pulse flex-col gap-6"
    >
      <div className="space-y-2">
        <div className="h-8 w-40 rounded-md bg-muted" />
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

      <div className="h-[58px] rounded-xl bg-card ring-1 ring-foreground/10" />

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="h-4 w-44 rounded-md bg-muted" />
          <div className="h-8 w-32 rounded-lg bg-muted" />
        </div>

        <div className="overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10">
          <div className="h-10 border-b bg-muted/40" />
          {Array.from({ length: 8 }).map((_, index) => (
            <div
              key={index}
              className="h-[62px] border-b bg-card last:border-b-0"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
