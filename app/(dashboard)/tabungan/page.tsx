import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { listGoalsWithProgress } from "@/lib/data";
import { buttonVariants } from "@/components/ui/button";
import { GoalStats } from "@/components/goals/goal-stats";
import { GoalList } from "@/components/goals/goal-list";
import { GOAL_STATUSES } from "@/lib/validation";
import type { GoalStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Tabungan",
  description: "Kelola target tabungan dan catat setoran Anda.",
};

const TABS: Array<{ value: GoalStatus; label: string }> = [
  { value: "active", label: "Aktif" },
  { value: "achieved", label: "Tercapai" },
  { value: "archived", label: "Diarsipkan" },
];

interface TabunganPageProps {
  searchParams: Promise<{ status?: string }>;
}

function resolveStatus(value?: string): GoalStatus {
  return GOAL_STATUSES.includes(value as GoalStatus)
    ? (value as GoalStatus)
    : "active";
}

export default async function TabunganPage({
  searchParams,
}: TabunganPageProps) {
  const params = await searchParams;
  const status = resolveStatus(params.status);

  const supabase = await createClient();
  const goals = await listGoalsWithProgress(supabase);
  const filteredGoals = goals.filter((goal) => goal.status === status);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Tabungan
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Buat target finansial, catat setoran, dan pantau progres tabungan
          Anda.
        </p>
      </div>

      <GoalStats goals={goals} />

      <div className="flex flex-wrap items-center gap-1 rounded-lg border bg-card p-1">
        {TABS.map((tab) => {
          const count = goals.filter((goal) => goal.status === tab.value).length;
          const isActive = status === tab.value;

          return (
            <Link
              key={tab.value}
              href={
                tab.value === "active"
                  ? "/tabungan"
                  : `/tabungan?status=${tab.value}`
              }
              className={cn(
                buttonVariants({
                  variant: isActive ? "secondary" : "ghost",
                  size: "sm",
                }),
                "gap-1.5",
              )}
            >
              {tab.label}
              <span
                className={cn(
                  "rounded-full px-1.5 text-[10px] font-semibold tabular-nums",
                  isActive
                    ? "bg-foreground/10 text-foreground"
                    : "bg-muted text-muted-foreground",
                )}
              >
                {count}
              </span>
            </Link>
          );
        })}
      </div>

      <GoalList goals={filteredGoals} status={status} />
    </div>
  );
}
