"use server";

import { requireUser, revalidateFinance } from "@/lib/actions/helpers";
import { CATEGORY_FALLBACK_NAMES } from "@/lib/category-labels";
import type { CategoryKind } from "@/lib/types";
import {
  categorySchema,
  type ActionResult,
  type CategoryFormValues,
} from "@/lib/validation";

type ExistingCategory = {
  id: string;
  name: string;
  kind: CategoryKind;
  is_default: boolean;
};

const DUPLICATE_ERROR =
  "Kategori dengan nama ini sudah ada untuk jenis tersebut";

export async function createCategory(
  values: CategoryFormValues,
): Promise<ActionResult> {
  const parsed = categorySchema.safeParse(values);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Data kategori tidak valid",
    };
  }

  const auth = await requireUser();
  if (!auth.ok) return auth;
  const { supabase, user } = auth;

  const { error } = await supabase.from("categories").insert({
    user_id: user.id,
    name: parsed.data.name,
    kind: parsed.data.kind,
    color: parsed.data.color,
    is_default: false,
  });

  if (error) {
    if (error.code === "23505") {
      return { ok: false, error: DUPLICATE_ERROR };
    }
    return { ok: false, error: error.message };
  }

  revalidateFinance("categories");

  return { ok: true };
}

export async function updateCategory(
  id: string,
  values: CategoryFormValues,
): Promise<ActionResult> {
  const parsed = categorySchema.safeParse(values);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Data kategori tidak valid",
    };
  }

  const auth = await requireUser();
  if (!auth.ok) return auth;
  const { supabase, user } = auth;

  const { data, error } = await supabase
    .from("categories")
    .select("id, name, kind, is_default")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    return { ok: false, error: "Gagal memuat kategori" };
  }

  if (!data) {
    return { ok: false, error: "Kategori tidak ditemukan" };
  }

  const existing = data as ExistingCategory;
  const kindChanged = existing.kind !== parsed.data.kind;
  const nameChanged = existing.name !== parsed.data.name;

  if (existing.is_default && nameChanged) {
    return {
      ok: false,
      error: "Nama kategori default tidak dapat diubah, tetapi warnanya bisa",
    };
  }

  if (existing.is_default && kindChanged) {
    return { ok: false, error: "Jenis kategori default tidak dapat diubah" };
  }

  if (kindChanged) {
    const [txCount, budgetCount] = await Promise.all([
      supabase
        .from("transactions")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("category_id", existing.id),
      supabase
        .from("budgets")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("category_id", existing.id),
    ]);

    if ((txCount.count ?? 0) > 0 || (budgetCount.count ?? 0) > 0) {
      return {
        ok: false,
        error:
          "Jenis kategori tidak dapat diubah karena sudah dipakai pada transaksi atau anggaran",
      };
    }
  }

  const { error: updateError } = await supabase
    .from("categories")
    .update({
      name: parsed.data.name,
      kind: parsed.data.kind,
      color: parsed.data.color,
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (updateError) {
    if (updateError.code === "23505") {
      return { ok: false, error: DUPLICATE_ERROR };
    }
    return { ok: false, error: updateError.message };
  }

  revalidateFinance("categories");

  return { ok: true };
}

export async function deleteCategory(id: string): Promise<ActionResult> {
  const auth = await requireUser();
  if (!auth.ok) return auth;
  const { supabase, user } = auth;

  const { data, error } = await supabase
    .from("categories")
    .select("id, name, kind, is_default")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    return { ok: false, error: "Gagal memuat kategori" };
  }

  if (!data) {
    return { ok: false, error: "Kategori tidak ditemukan" };
  }

  const category = data as ExistingCategory;

  if (category.is_default) {
    return {
      ok: false,
      error: "Kategori default tidak dapat dihapus",
    };
  }

  const fallbackName = CATEGORY_FALLBACK_NAMES[category.kind];

  const { data: fallback, error: fallbackError } = await supabase
    .from("categories")
    .select("id")
    .eq("user_id", user.id)
    .eq("kind", category.kind)
    .eq("name", fallbackName)
    .neq("id", category.id)
    .maybeSingle();

  if (fallbackError) {
    return { ok: false, error: "Gagal memuat kategori pengganti" };
  }

  if (!fallback) {
    return {
      ok: false,
      error: `Kategori pengganti "${fallbackName}" tidak ditemukan. Buat kategori tersebut terlebih dahulu sebelum menghapus kategori ini.`,
    };
  }

  const fallbackId = (fallback as { id: string }).id;

  const { error: reassignError } = await supabase
    .from("transactions")
    .update({ category_id: fallbackId })
    .eq("user_id", user.id)
    .eq("category_id", category.id);

  if (reassignError) {
    return {
      ok: false,
      error:
        "Gagal memindahkan transaksi ke kategori pengganti. Kategori belum dihapus.",
    };
  }

  const { data: deleted, error: deleteError } = await supabase
    .from("categories")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id)
    .select("id")
    .maybeSingle();

  if (deleteError) {
    return { ok: false, error: deleteError.message };
  }

  if (!deleted) {
    return { ok: false, error: "Kategori tidak ditemukan" };
  }

  revalidateFinance("categories");

  return { ok: true };
}
