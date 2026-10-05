import type { Metadata } from "next";
import { signInWithGoogle } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";
import { WalletMinimalIcon } from "lucide-react";

export const metadata: Metadata = {
  title: "Masuk",
};

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 px-6">
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <WalletMinimalIcon className="size-6" />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">Money Tracker</h1>
        <p className="max-w-xs text-sm text-muted-foreground">
          Lacak pengeluaran, atur anggaran, dan capai target tabunganmu dalam
          satu tempat.
        </p>
      </div>

      <form
        action={async () => {
          "use server";
          await signInWithGoogle();
        }}
        className="w-full max-w-xs"
      >
        <Button type="submit" className="w-full" size="lg">
          <GoogleIcon />
          Lanjut dengan Google
        </Button>
      </form>

      <p className="text-xs text-muted-foreground">
        Dengan melanjutkan, Anda menyetujui ketentuan layanan.
      </p>
    </main>
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
