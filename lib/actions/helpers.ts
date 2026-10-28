import { revalidatePath } from "next/cache";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import type { CategoryKind } from "@/lib/types";

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

export type RequireUserResult =
  | { ok: true; supabase: SupabaseClient; user: User }
  | { ok: false; error: string };

/** Resolve the authenticated Supabase client and user for a server action. */
export async function requireUser(): Promise<RequireUserResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      ok: false,
      error: "Sesi tidak ditemukan, silakan masuk kembali",
    };
  }

  return { ok: true, supabase, user };
}

export type VerifyCategoryResult =
  | { ok: true; category: { id: string; kind: CategoryKind } }
  | { ok: false; error: string };

/**
 * Ensure a category exists, belongs to the user, and matches the expected kind.
 * Cross-user IDs resolve to "not found" because the query is scoped by user_id.
 */
export async function verifyCategoryKind(
  supabase: SupabaseClient,
  userId: string,
  categoryId: string,
  kind: CategoryKind,
): Promise<VerifyCategoryResult> {
  const { data, error } = await supabase
    .from("categories")
    .select("id, kind")
    .eq("id", categoryId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    return { ok: false, error: "Gagal memverifikasi kategori" };
  }

  if (!data) {
    return {
      ok: false,
      error: "Kategori tidak ditemukan atau bukan milik Anda",
    };
  }

  const category = data as { id: string; kind: CategoryKind };

  if (category.kind !== kind) {
    return {
      ok: false,
      error: "Kategori tidak sesuai dengan jenis yang dipilih",
    };
  }

  return { ok: true, category };
}

export type FinanceScope = "transactions" | "budgets" | "goals" | "categories";

const REVALIDATE_PATHS: Record<FinanceScope, string[]> = {
  transactions: [
    "/transaksi",
    "/dashboard",
    "/anggaran",
    "/analisis",
    "/histori",
  ],
  budgets: ["/anggaran", "/dashboard", "/analisis"],
  goals: ["/tabungan", "/dashboard", "/analisis", "/transaksi"],
  categories: [
    "/kategori",
    "/transaksi",
    "/anggaran",
    "/analisis",
    "/dashboard",
  ],
};

/** Revalidate every route affected by a finance mutation. */
export function revalidateFinance(...scopes: FinanceScope[]): void {
  const paths = new Set(scopes.flatMap((scope) => REVALIDATE_PATHS[scope]));
  for (const path of paths) revalidatePath(path);
}
