import type { SupabaseClient } from "@supabase/supabase-js";

export const shoppingKeys = {
  all: (pairId: string) => ["shopping", pairId] as const,
  active: (pairId: string) => ["shopping", pairId, "active"] as const,
};

export async function getActiveShoppingItems(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("shopping_items")
    .select("*")
    .eq("is_purchased", false)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function addShoppingItem(
  supabase: SupabaseClient,
  item: {
    pair_id: string;
    name: string;
    quantity?: string;
    category?: string;
    created_by: string;
  }
) {
  const { data, error } = await supabase
    .from("shopping_items")
    .insert(item)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function toggleShoppingItem(
  supabase: SupabaseClient,
  itemId: string,
  isPurchased: boolean,
  purchasedBy?: string
) {
  const { error } = await supabase
    .from("shopping_items")
    .update({
      is_purchased: isPurchased,
      purchased_by: isPurchased ? purchasedBy : null,
    })
    .eq("id", itemId);
  if (error) throw error;
}

export async function deleteShoppingItem(
  supabase: SupabaseClient,
  itemId: string
) {
  const { error } = await supabase
    .from("shopping_items")
    .delete()
    .eq("id", itemId);
  if (error) throw error;
}
