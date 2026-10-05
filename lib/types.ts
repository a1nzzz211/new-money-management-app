export type TransactionType = "income" | "expense" | "savings";
export type CategoryKind = "income" | "expense" | "savings";
export type GoalStatus = "active" | "achieved" | "archived";

export interface Profile {
  id: string;
  email: string | null;
  display_name: string | null;
  avatar_url: string | null;
  currency: string;
  created_at: string;
}

export interface Category {
  id: string;
  user_id: string;
  name: string;
  kind: CategoryKind;
  color: string;
  icon: string | null;
  is_default: boolean;
  created_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  category_id: string | null;
  type: TransactionType;
  amount: number;
  description: string | null;
  occurred_on: string; // ISO date (YYYY-MM-DD)
  created_at: string;
  // join
  category?: Category | null;
}

export interface Budget {
  id: string;
  user_id: string;
  category_id: string;
  month: string; // ISO date, first of month (YYYY-MM-01)
  limit_amount: number;
  created_at: string;
  category?: Category | null;
}

export interface SavingsGoal {
  id: string;
  user_id: string;
  name: string;
  target_amount: number;
  deadline: string | null;
  status: GoalStatus;
  created_at: string;
}

export interface GoalContribution {
  id: string;
  user_id: string;
  goal_id: string;
  transaction_id: string | null;
  amount: number;
  contributed_on: string;
  created_at: string;
}

// Minimal Supabase Database generic shape used by createServerClient<Database>.
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Partial<Profile>;
        Update: Partial<Profile>;
      };
      categories: {
        Row: Category;
        Insert: Partial<Category>;
        Update: Partial<Category>;
      };
      transactions: {
        Row: Transaction;
        Insert: Partial<Transaction>;
        Update: Partial<Transaction>;
      };
      budgets: {
        Row: Budget;
        Insert: Partial<Budget>;
        Update: Partial<Budget>;
      };
      savings_goals: {
        Row: SavingsGoal;
        Insert: Partial<SavingsGoal>;
        Update: Partial<SavingsGoal>;
      };
      goal_contributions: {
        Row: GoalContribution;
        Insert: Partial<GoalContribution>;
        Update: Partial<GoalContribution>;
      };
    };
    Views: {
      monthly_summary: {
        Row: {
          user_id: string;
          month: string;
          type: TransactionType;
          total: number;
          count: number;
        };
      };
    };
    Functions: {
      contribute_to_goal: {
        Args: { p_goal_id: string; p_amount: number; p_contributed_on: string };
        Returns: string;
      };
    };
    Enums: Record<string, never>;
  };
}
