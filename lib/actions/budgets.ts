"use server";

import {
  requireUser,
  revalidateFinance,
  verifyCategoryKind,
} from "@/lib/actions/helpers";
import { bulanValid } from "@/lib/format";
import {
  budgetSchema,
  type ActionResult,
  type BudgetFormValues,
} from "@/lib/validation";

const updateBudgetSchema = budgetSchema.pick({ limitAmount: true });

export async function createBudget(
  values: BudgetFormValues,
): Promise<ActionResult> {
  const parsed = budgetSchema.safeParse(values);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Data anggaran tidak valid",
    };
  }

  const month = bulanValid(parsed.data.month);
  if (!month) {
    return { ok: false, error: "Bulan tidak valid" };
  }

  const auth = await requireUser();
  if (!auth.ok) return auth;
  const { supabase, user } = auth;

  const category = await verifyCategoryKind(
    supabase,
    user.id,
    parsed.data.categoryId,
    "expense",
  );
  if (!category.ok) return category;

  const { error } = await supabase.from("budgets").insert({
    user_id: user.id,
    category_id: category.category.id,
    month: `${month}-01`,
    limit_amount: parsed.data.limitAmount,
  });

  if (error) {
    if (error.code === "23505") {
      return {
        ok: false,
        error: "Anggaran untuk kategori ini sudah ada di bulan tersebut",
      };
    }
    return { ok: false, error: error.message };
  }

  revalidateFinance("budgets");

  return { ok: true };
}

export async function updateBudget(
  id: string,
  values: { limitAmount: number },
): Promise<ActionResult> {
  const parsed = updateBudgetSchema.safeParse(values);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Nominal anggaran tidak valid",
    };
  }

  const auth = await requireUser();
  if (!auth.ok) return auth;
  const { supabase, user } = auth;

  const { data, error } = await supabase
    .from("budgets")
    .update({ limit_amount: parsed.data.limitAmount })
    .eq("id", id)
    .eq("user_id", user.id)
    .select("id")
    .maybeSingle();

  if (error) {
    return { ok: false, error: error.message };
  }

  if (!data) {
    return { ok: false, error: "Anggaran tidak ditemukan" };
  }

  revalidateFinance("budgets");

  return { ok: true };
}

export async function deleteBudget(id: string): Promise<ActionResult> {
  const auth = await requireUser();
  if (!auth.ok) return auth;
  const { supabase, user } = auth;

  const { data, error } = await supabase
    .from("budgets")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id)
    .select("id")
    .maybeSingle();

  if (error) {
    return { ok: false, error: error.message };
  }

  if (!data) {
    return { ok: false, error: "Anggaran tidak ditemukan" };
  }

  revalidateFinance("budgets");

  return { ok: true };
}
