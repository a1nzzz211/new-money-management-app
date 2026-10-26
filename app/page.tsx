import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signInWithGoogle } from "@/lib/auth/actions";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  ArrowLeftRightIcon,
  BarChart3Icon,
  CheckCircle2Icon,
  PiggyBankIcon,
  TargetIcon,
  WalletMinimalIcon,
} from "lucide-react";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* Navigation header */}
      <header className="flex h-16 items-center justify-between border-b px-6 lg:px-12 bg-card/50 backdrop-blur">
        <div className="flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <WalletMinimalIcon className="size-5" />
          </div>
          <span className="text-base font-bold tracking-tight">
            Money Tracker
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          >
            Masuk
          </Link>
        </div>
      </header>

      {/* Hero section */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-16 lg:py-24 text-center">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-6">
          <div className="inline-flex items-center gap-2 rounded-full border bg-muted/50 px-3.5 py-1 text-xs font-medium text-muted-foreground">
            <CheckCircle2Icon className="size-3.5 text-primary" />
            Pengelolaan Keuangan Cerdas & Mandiri
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
            Kendalikan Arus Kas & Wujudkan Target Finansial Anda
          </h1>

          <p className="max-w-2xl text-base text-muted-foreground sm:text-lg">
            Money Tracker membantu Anda mencatat setiap pengeluaran, mengatur
            anggaran bulanan terarah, memonitor tabungan impian, serta
            menyajikan analisis visual keuangan secara real-time.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <form
              action={async () => {
                "use server";
                await signInWithGoogle();
              }}
            >
              <Button
                type="submit"
                size="lg"
                className="w-full sm:w-auto gap-2 px-8"
              >
                <GoogleIcon />
                Mulai dengan Google
              </Button>
            </form>
            <Link
              href="/login"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "w-full sm:w-auto",
              )}
            >
              Pelajari Lebih Lanjut
            </Link>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="mx-auto mt-20 grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-4 text-left">
          <Card className="shadow-xs border-muted">
            <CardContent className="flex flex-col gap-2 pt-6">
              <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <ArrowLeftRightIcon className="size-5" />
              </div>
              <h3 className="font-semibold text-foreground">Catat Transaksi</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Catat pemasukan dan pengeluaran harian lengkap dengan kategori
                dan catatan.
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-xs border-muted">
            <CardContent className="flex flex-col gap-2 pt-6">
              <div className="flex size-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <TargetIcon className="size-5" />
              </div>
              <h3 className="font-semibold text-foreground">Batas Anggaran</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Atur batasan belanja bulanan per kategori agar pengeluaran tetap
                terkontrol.
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-xs border-muted">
            <CardContent className="flex flex-col gap-2 pt-6">
              <div className="flex size-10 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <PiggyBankIcon className="size-5" />
              </div>
              <h3 className="font-semibold text-foreground">Target Tabungan</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Tetapkan target dana darurat atau liburan, dan pantau progres
                setoran tabungan.
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-xs border-muted">
            <CardContent className="flex flex-col gap-2 pt-6">
              <div className="flex size-10 items-center justify-center rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400">
                <BarChart3Icon className="size-5" />
              </div>
              <h3 className="font-semibold text-foreground">Analisis Visual</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Visualisasi tren arus kas 6 bulan dan komposisi pengeluaran
                terbesar Anda.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t py-6 text-center text-xs text-muted-foreground">
        <p>
          &copy; {new Date().getFullYear()} Money Tracker. Hak Cipta Dilindungi.
        </p>
      </footer>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg className="size-4" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="currentColor"
        d="M12 10.2v3.9h5.5c-.24 1.4-1.66 4.1-5.5 4.1-3.3 0-6-2.75-6-6.15S8.7 5.9 12 5.9c1.9 0 3.15.8 3.87 1.5l2.64-2.55C16.9 3.3 14.7 2.3 12 2.3 6.7 2.3 2.4 6.6 2.4 12S6.7 21.7 12 21.7c5.55 0 9.22-3.9 9.22-9.4 0-.63-.07-1.1-.16-1.6H12z"
      />
    </svg>
  );
}
