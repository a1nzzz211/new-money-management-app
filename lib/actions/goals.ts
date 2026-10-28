"use server";

import { requireUser, revalidateFinance } from "@/lib/actions/helpers";
import type { GoalStatus } from "@/lib/types";
import {
  GOAL_STATUSES,
  contributionSchema,
  goalSchema,
  type ActionResult,
  type ContributionFormValues,
  type GoalFormValues,
} from "@/lib/validation";

export async function createGoal(
  values: GoalFormValues,
): Promise<ActionResult> {
  const parsed = goalSchema.safeParse(values);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Data target tidak valid",
    };
  }

  const auth = await requireUser();
  if (!auth.ok) return auth;
  const { supabase, user } = auth;

  const { error } = await supabase.from("savings_goals").insert({
    user_id: user.id,
    name: parsed.data.name,
    target_amount: parsed.data.targetAmount,
    deadline: parsed.data.deadline?.trim() ? parsed.data.deadline : null,
    status: "active",
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidateFinance("goals");

  return { ok: true };
}

export async function updateGoal(
  id: string,
  values: GoalFormValues,
): Promise<ActionResult> {
  const parsed = goalSchema.safeParse(values);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Data target tidak valid",
    };
  }

  const auth = await requireUser();
  if (!auth.ok) return auth;
  const { supabase, user } = auth;

  const { data, error } = await supabase
    .from("savings_goals")
    .update({
      name: parsed.data.name,
      target_amount: parsed.data.targetAmount,
      deadline: parsed.data.deadline?.trim() ? parsed.data.deadline : null,
    })
    .eq("id", id)
    .eq("user_id", user.id)
    .select("id")
    .maybeSingle();

  if (error) {
    return { ok: false, error: error.message };
  }

  if (!data) {
    return { ok: false, error: "Target tabungan tidak ditemukan" };
  }

  revalidateFinance("goals");

  return { ok: true };
}

export async function deleteGoal(id: string): Promise<ActionResult> {
  const auth = await requireUser();
  if (!auth.ok) return auth;
  const { supabase, user } = auth;

  const { data, error } = await supabase
    .from("savings_goals")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id)
    .select("id")
    .maybeSingle();

  if (error) {
    return { ok: false, error: error.message };
  }

  if (!data) {
    return { ok: false, error: "Target tabungan tidak ditemukan" };
  }

  revalidateFinance("goals");

  return { ok: true };
}

export async function contributeToGoal(
  values: ContributionFormValues,
): Promise<ActionResult> {
  const parsed = contributionSchema.safeParse(values);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Data setoran tidak valid",
    };
  }

  const auth = await requireUser();
  if (!auth.ok) return auth;
  const { supabase, user } = auth;

  const { data: goal, error: goalError } = await supabase
    .from("savings_goals")
    .select("id, status")
    .eq("id", parsed.data.goalId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (goalError) {
    return { ok: false, error: "Gagal memverifikasi target tabungan" };
  }

  if (!goal) {
    return { ok: false, error: "Target tabungan tidak ditemukan" };
  }

  if ((goal as { status: GoalStatus }).status !== "active") {
    return {
      ok: false,
      error: "Setoran hanya dapat dilakukan pada target yang masih aktif",
    };
  }

  const { error } = await supabase.rpc("contribute_to_goal", {
    p_goal_id: parsed.data.goalId,
    p_amount: parsed.data.amount,
    p_contributed_on: parsed.data.contributedOn,
  });

  if (error) {
    return { ok: false, error: error.message || "Gagal mencatat setoran" };
  }

  revalidateFinance("goals");

  return { ok: true };
}

const ALLOWED_TRANSITIONS: Record<GoalStatus, GoalStatus[]> = {
  active: ["archived"],
  achieved: ["archived"],
  archived: ["active"],
};

export async function updateGoalStatus(
  id: string,
  status: GoalStatus,
): Promise<ActionResult> {
  if (!GOAL_STATUSES.includes(status)) {
    return { ok: false, error: "Status target tidak valid" };
  }

  const auth = await requireUser();
  if (!auth.ok) return auth;
  const { supabase, user } = auth;

  const { data, error } = await supabase
    .from("savings_goals")
    .select("id, status")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    return { ok: false, error: "Gagal memuat status target" };
  }

  if (!data) {
    return { ok: false, error: "Target tabungan tidak ditemukan" };
  }

  const current = (data as { status: GoalStatus }).status;

  if (current === status) {
    return { ok: true };
  }

  if (!ALLOWED_TRANSITIONS[current].includes(status)) {
    return {
      ok: false,
      error:
        current === "achieved"
          ? "Target yang sudah tercapai tidak dapat diaktifkan kembali"
          : "Perubahan status target tidak diizinkan",
    };
  }

  const { error: updateError } = await supabase
    .from("savings_goals")
    .update({ status })
    .eq("id", id)
    .eq("user_id", user.id);

  if (updateError) {
    return { ok: false, error: updateError.message };
  }

  revalidateFinance("goals");

  return { ok: true };
}
