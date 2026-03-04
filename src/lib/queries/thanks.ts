import { SupabaseClient } from "@supabase/supabase-js";

export const thanksKeys = {
  all: ["thanks"] as const,
  today: () => [...thanksKeys.all, "today"] as const,
  week: () => [...thanksKeys.all, "week"] as const,
};

// 今日のありがとう数を取得
export async function getTodayThanks(supabase: SupabaseClient) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const { data, error } = await supabase
    .from("thanks_logs")
    .select("*")
    .gte("created_at", today.toISOString())
    .lt("created_at", tomorrow.toISOString())
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

// 今週のありがとう数を取得
export async function getWeekThanks(supabase: SupabaseClient) {
  const now = new Date();
  const weekAgo = new Date(now);
  weekAgo.setDate(weekAgo.getDate() - 7);

  const { data, error } = await supabase
    .from("thanks_logs")
    .select("*")
    .gte("created_at", weekAgo.toISOString())
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

// ありがとうを送る
export async function addThanksLog(
  supabase: SupabaseClient,
  log: {
    pair_id: string;
    message?: string;
    created_by: string;
  }
) {
  const { data, error } = await supabase
    .from("thanks_logs")
    .insert(log)
    .select()
    .single();

  if (error) throw error;
  return data;
}
