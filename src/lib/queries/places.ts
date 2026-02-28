import type { SupabaseClient } from "@supabase/supabase-js";

export const placeKeys = {
  all: (pairId: string) => ["places", pairId] as const,
};

export async function getPlaces(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("places")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function addPlace(
  supabase: SupabaseClient,
  place: {
    pair_id: string;
    name: string;
    url?: string;
    area?: string;
    tags?: string[];
    memo?: string;
    created_by: string;
  }
) {
  const { data, error } = await supabase
    .from("places")
    .insert(place)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updatePlace(
  supabase: SupabaseClient,
  placeId: string,
  updates: {
    name?: string;
    url?: string | null;
    area?: string | null;
    tags?: string[];
    memo?: string | null;
    status?: string;
  }
) {
  const { error } = await supabase
    .from("places")
    .update(updates)
    .eq("id", placeId);
  if (error) throw error;
}

export async function deletePlace(supabase: SupabaseClient, placeId: string) {
  const { error } = await supabase.from("places").delete().eq("id", placeId);
  if (error) throw error;
}
