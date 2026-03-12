import type { SupabaseClient } from "@supabase/supabase-js";

export const diaryKeys = {
  all: (pairId: string) => ["diary", pairId] as const,
  month: (pairId: string, year: number, month: number) =>
    ["diary", pairId, year, month] as const,
  entry: (id: string) => ["diary", "entry", id] as const,
};

export async function getDiaryEntries(
  supabase: SupabaseClient,
  year: number,
  month: number
) {
  const startDate = `${year}-${String(month + 1).padStart(2, "0")}-01`;
  const endMonth = month === 11 ? 0 : month + 1;
  const endYear = month === 11 ? year + 1 : year;
  const endDate = `${endYear}-${String(endMonth + 1).padStart(2, "0")}-01`;

  const { data, error } = await supabase
    .from("diary_entries")
    .select("*")
    .gte("entry_date", startDate)
    .lt("entry_date", endDate)
    .order("entry_date", { ascending: false });
  if (error) throw error;
  return data;
}

export async function getDiaryEntry(supabase: SupabaseClient, id: string) {
  const { data, error } = await supabase
    .from("diary_entries")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
}

export async function addDiaryEntry(
  supabase: SupabaseClient,
  entry: {
    pair_id: string;
    title?: string;
    body: string;
    mood?: number;
    weather?: string;
    is_shared?: boolean;
    entry_date?: string;
    created_by: string;
  }
) {
  const { data, error } = await supabase
    .from("diary_entries")
    .insert(entry)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateDiaryEntry(
  supabase: SupabaseClient,
  entryId: string,
  updates: {
    title?: string | null;
    body?: string;
    mood?: number | null;
    weather?: string | null;
    is_shared?: boolean;
  }
) {
  const { error } = await supabase
    .from("diary_entries")
    .update(updates)
    .eq("id", entryId);
  if (error) throw error;
}

export async function deleteDiaryEntry(
  supabase: SupabaseClient,
  entryId: string
) {
  const { error } = await supabase
    .from("diary_entries")
    .delete()
    .eq("id", entryId);
  if (error) throw error;
}
