import type { SupabaseClient } from "@supabase/supabase-js";

export const pantryKeys = {
  all: (pairId: string) => ["pantry", pairId] as const,
  active: (pairId: string) => ["pantry", pairId, "active"] as const,
};

export async function getActivePantryItems(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("pantry_items")
    .select("*")
    .eq("status", "active")
    .order("expiry_date", { ascending: true, nullsFirst: false });
  if (error) throw error;
  return data;
}

export async function addPantryItem(
  supabase: SupabaseClient,
  item: {
    pair_id: string;
    name: string;
    quantity?: string;
    category?: string;
    storage_location?: string;
    purchase_date?: string;
    expiry_date?: string;
    memo?: string;
    created_by: string;
  }
) {
  const { data, error } = await supabase
    .from("pantry_items")
    .insert(item)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function consumePantryItem(
  supabase: SupabaseClient,
  itemId: string
) {
  const { error } = await supabase
    .from("pantry_items")
    .update({ status: "consumed" })
    .eq("id", itemId);
  if (error) throw error;
}

export async function updatePantryItem(
  supabase: SupabaseClient,
  itemId: string,
  updates: {
    name?: string;
    quantity?: string;
    category?: string;
    storage_location?: string;
    purchase_date?: string | null;
    expiry_date?: string | null;
    memo?: string | null;
  }
) {
  const { error } = await supabase
    .from("pantry_items")
    .update(updates)
    .eq("id", itemId);
  if (error) throw error;
}

export async function deletePantryItem(
  supabase: SupabaseClient,
  itemId: string
) {
  const { error } = await supabase
    .from("pantry_items")
    .delete()
    .eq("id", itemId);
  if (error) throw error;
}

export async function moveToShoppingList(
  supabase: SupabaseClient,
  item: { pair_id: string; name: string; category?: string; created_by: string; source_pantry_id?: string }
) {
  const { error } = await supabase.from("shopping_items").insert(item);
  if (error) throw error;
}
