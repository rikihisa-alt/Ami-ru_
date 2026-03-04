import { SupabaseClient } from "@supabase/supabase-js";

export const moodKeys = {
  all: ["moods"] as const,
  today: () => [...moodKeys.all, "today"] as const,
  week: () => [...moodKeys.all, "week"] as const,
};

// 今日の自分のムードを取得
export async function getTodayMood(supabase: SupabaseClient, userId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const { data, error } = await supabase
    .from("mood_logs")
    .select("*")
    .eq("created_by", userId)
    .gte("created_at", today.toISOString())
    .lt("created_at", tomorrow.toISOString())
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data;
}

// 今週のペアのムードを取得（週次サマリー用）
export async function getWeekMoods(supabase: SupabaseClient) {
  const now = new Date();
  const weekAgo = new Date(now);
  weekAgo.setDate(weekAgo.getDate() - 7);

  const { data, error } = await supabase
    .from("mood_logs")
    .select("*")
    .gte("created_at", weekAgo.toISOString())
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

// ムードを記録
export async function addMoodLog(
  supabase: SupabaseClient,
  log: {
    pair_id: string;
    mood: number;
    note?: string;
    created_by: string;
  }
) {
  const { data, error } = await supabase
    .from("mood_logs")
    .insert(log)
    .select()
    .single();

  if (error) throw error;
  return data;
}
