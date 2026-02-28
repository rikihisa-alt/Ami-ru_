import type { SupabaseClient } from "@supabase/supabase-js";

export const calendarKeys = {
  all: (pairId: string) => ["calendar", pairId] as const,
  month: (pairId: string, year: number, month: number) =>
    ["calendar", pairId, year, month] as const,
  today: (pairId: string) => ["calendar", pairId, "today"] as const,
};

export async function getTodayEvents(supabase: SupabaseClient) {
  const today = new Date();
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
  const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1).toISOString();

  const { data, error } = await supabase
    .from("calendar_events")
    .select("*")
    .or(`and(start_at.gte.${startOfDay},start_at.lt.${endOfDay}),and(is_all_day.eq.true,start_at.gte.${startOfDay},start_at.lt.${endOfDay})`)
    .order("start_at", { ascending: true });
  if (error) throw error;
  return data;
}

export async function getMonthEvents(
  supabase: SupabaseClient,
  year: number,
  month: number
) {
  const startOfMonth = new Date(year, month, 1).toISOString();
  const endOfMonth = new Date(year, month + 1, 1).toISOString();

  const { data, error } = await supabase
    .from("calendar_events")
    .select("*")
    .gte("start_at", startOfMonth)
    .lt("start_at", endOfMonth)
    .order("start_at", { ascending: true });
  if (error) throw error;
  return data;
}

export async function addCalendarEvent(
  supabase: SupabaseClient,
  event: {
    pair_id: string;
    title: string;
    description?: string;
    is_all_day?: boolean;
    start_at: string;
    end_at?: string;
    location?: string;
    source_place_id?: string;
    created_by: string;
  }
) {
  const { data, error } = await supabase
    .from("calendar_events")
    .insert(event)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateCalendarEvent(
  supabase: SupabaseClient,
  eventId: string,
  updates: {
    title?: string;
    description?: string;
    is_all_day?: boolean;
    start_at?: string;
    end_at?: string | null;
    location?: string | null;
  }
) {
  const { error } = await supabase
    .from("calendar_events")
    .update(updates)
    .eq("id", eventId);
  if (error) throw error;
}

export async function deleteCalendarEvent(
  supabase: SupabaseClient,
  eventId: string
) {
  const { error } = await supabase
    .from("calendar_events")
    .delete()
    .eq("id", eventId);
  if (error) throw error;
}
