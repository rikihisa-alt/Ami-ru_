import type { SupabaseClient } from "@supabase/supabase-js";

export const transactionKeys = {
  all: (pairId: string) => ["transactions", pairId] as const,
  month: (pairId: string, year: number, month: number) =>
    ["transactions", pairId, year, month] as const,
};

export async function getMonthTransactions(
  supabase: SupabaseClient,
  year: number,
  month: number
) {
  const startDate = `${year}-${String(month + 1).padStart(2, "0")}-01`;
  const endMonth = month === 11 ? 0 : month + 1;
  const endYear = month === 11 ? year + 1 : year;
  const endDate = `${endYear}-${String(endMonth + 1).padStart(2, "0")}-01`;

  const { data, error } = await supabase
    .from("money_transactions")
    .select("*")
    .gte("scheduled_date", startDate)
    .lt("scheduled_date", endDate)
    .order("scheduled_date", { ascending: true });
  if (error) throw error;
  return data;
}

export async function getAllTransactions(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("money_transactions")
    .select("*")
    .order("scheduled_date", { ascending: false });
  if (error) throw error;
  return data;
}

export async function addTransaction(
  supabase: SupabaseClient,
  tx: {
    pair_id: string;
    type: "income" | "expense";
    amount: number;
    category?: string;
    is_confirmed?: boolean;
    scheduled_date?: string;
    recurrence?: string;
    memo?: string;
    created_by: string;
  }
) {
  const { data, error } = await supabase
    .from("money_transactions")
    .insert(tx)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateTransaction(
  supabase: SupabaseClient,
  txId: string,
  updates: {
    type?: "income" | "expense";
    amount?: number;
    category?: string | null;
    is_confirmed?: boolean;
    scheduled_date?: string | null;
    recurrence?: string | null;
    memo?: string | null;
  }
) {
  const { error } = await supabase
    .from("money_transactions")
    .update(updates)
    .eq("id", txId);
  if (error) throw error;
}

export async function deleteTransaction(
  supabase: SupabaseClient,
  txId: string
) {
  const { error } = await supabase
    .from("money_transactions")
    .delete()
    .eq("id", txId);
  if (error) throw error;
}
