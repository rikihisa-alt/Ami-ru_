import type { SupabaseClient } from "@supabase/supabase-js";

export const expenseKeys = {
  all: (pairId: string) => ["expenses", pairId] as const,
  month: (pairId: string, year: number, month: number) =>
    ["expenses", pairId, year, month] as const,
};

export async function getMonthExpenses(
  supabase: SupabaseClient,
  year: number,
  month: number
) {
  const startDate = `${year}-${String(month + 1).padStart(2, "0")}-01`;
  const endMonth = month === 11 ? 0 : month + 1;
  const endYear = month === 11 ? year + 1 : year;
  const endDate = `${endYear}-${String(endMonth + 1).padStart(2, "0")}-01`;

  const { data, error } = await supabase
    .from("expenses")
    .select("*")
    .gte("date", startDate)
    .lt("date", endDate)
    .order("date", { ascending: false });
  if (error) throw error;
  return data;
}

export async function addExpense(
  supabase: SupabaseClient,
  expense: {
    pair_id: string;
    date?: string;
    amount: number;
    category?: string;
    payer_id: string;
    bearer?: string;
    ratio_payer?: number;
    memo?: string;
    created_by: string;
  }
) {
  const { data, error } = await supabase
    .from("expenses")
    .insert(expense)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateExpense(
  supabase: SupabaseClient,
  expenseId: string,
  updates: {
    date?: string;
    amount?: number;
    category?: string;
    payer_id?: string;
    bearer?: string;
    ratio_payer?: number;
    memo?: string;
  }
) {
  const { error } = await supabase
    .from("expenses")
    .update(updates)
    .eq("id", expenseId);
  if (error) throw error;
}

export async function deleteExpense(
  supabase: SupabaseClient,
  expenseId: string
) {
  const { error } = await supabase
    .from("expenses")
    .delete()
    .eq("id", expenseId);
  if (error) throw error;
}
