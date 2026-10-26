"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
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

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "Sesi tidak ditemukan, silakan masuk kembali" };
  }

  const { error } = await supabase.from("transactions").insert({
    user_id: user.id,
    type: parsed.data.type,
    category_id: parsed.data.categoryId,
    amount: parsed.data.amount,
    description: parsed.data.description?.trim() || null,
    occurred_on: parsed.data.occurredOn,
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath("/transaksi");
  revalidatePath("/dashboard");
  revalidatePath("/analisis");
  revalidatePath("/histori");

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

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "Sesi tidak ditemukan, silakan masuk kembali" };
  }

  const { error } = await supabase
    .from("transactions")
    .update({
      type: parsed.data.type,
      category_id: parsed.data.categoryId,
      amount: parsed.data.amount,
      description: parsed.data.description?.trim() || null,
      occurred_on: parsed.data.occurredOn,
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath("/transaksi");
  revalidatePath("/dashboard");
  revalidatePath("/analisis");
  revalidatePath("/histori");

  return { ok: true };
}

export async function deleteTransaction(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "Sesi tidak ditemukan, silakan masuk kembali" };
  }

  const { error } = await supabase
    .from("transactions")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath("/transaksi");
  revalidatePath("/dashboard");
  revalidatePath("/analisis");
  revalidatePath("/histori");

  return { ok: true };
}

