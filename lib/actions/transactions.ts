"use server";

import {
  requireUser,
  revalidateFinance,
  verifyCategoryKind,
} from "@/lib/actions/helpers";
import {
  transactionSchema,
  type ActionResult,
  type TransactionFormValues,
} from "@/lib/validation";

export async function createTransaction(
  values: TransactionFormValues
): Promise<ActionResult> {
  const parsed = transactionSchema.safeParse(values);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Data transaksi tidak valid",
    };
  }

  const auth = await requireUser();
  if (!auth.ok) return auth;
  const { supabase, user } = auth;

  const category = await verifyCategoryKind(
    supabase,
    user.id,
    parsed.data.categoryId,
    parsed.data.type,
  );
  if (!category.ok) return category;

  const { error } = await supabase.from("transactions").insert({
    user_id: user.id,
    type: parsed.data.type,
    category_id: category.category.id,
    amount: parsed.data.amount,
    description: parsed.data.description?.trim() || null,
    occurred_on: parsed.data.occurredOn,
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidateFinance("transactions");

  return { ok: true };
}

export async function updateTransaction(
  id: string,
  values: TransactionFormValues
): Promise<ActionResult> {
  const parsed = transactionSchema.safeParse(values);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Data transaksi tidak valid",
    };
  }

  const auth = await requireUser();
  if (!auth.ok) return auth;
  const { supabase, user } = auth;

  const category = await verifyCategoryKind(
    supabase,
    user.id,
    parsed.data.categoryId,
    parsed.data.type,
  );
  if (!category.ok) return category;

  const { error } = await supabase
    .from("transactions")
    .update({
      type: parsed.data.type,
      category_id: category.category.id,
      amount: parsed.data.amount,
      description: parsed.data.description?.trim() || null,
      occurred_on: parsed.data.occurredOn,
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidateFinance("transactions");

  return { ok: true };
}

export async function deleteTransaction(id: string): Promise<ActionResult> {
  const auth = await requireUser();
  if (!auth.ok) return auth;
  const { supabase, user } = auth;

  const { error } = await supabase
    .from("transactions")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidateFinance("transactions");

  return { ok: true };
}
