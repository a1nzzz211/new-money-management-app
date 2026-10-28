import Link from "next/link";
import { ConstructionIcon } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ComingSoonProps {
  title: string;
  description: string;
}

export function ComingSoon({ title, description }: ComingSoonProps) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {title}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>

      <div className="flex min-h-[320px] flex-col items-center justify-center gap-4 rounded-xl border border-dashed bg-card p-8 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <ConstructionIcon className="size-6" />
        </div>
        <div className="space-y-1">
          <p className="text-base font-semibold text-foreground">
            Segera Hadir
          </p>
          <p className="max-w-md text-sm text-muted-foreground">
            Fitur ini sedang dalam pengembangan. Kembali lagi nanti.
          </p>
        </div>
        <Link
          href="/dashboard"
          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
        >
          Kembali ke Dashboard
        </Link>
      </div>
    </div>
  );
}
