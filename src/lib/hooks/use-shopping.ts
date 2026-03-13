"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabase, useUser } from "@/providers/supabase-provider";
import {
  shoppingKeys,
  getActiveShoppingItems,
  addShoppingItem,
  toggleShoppingItem,
  deleteShoppingItem,
} from "@/lib/queries/shopping";
import { useRealtimeSubscription } from "./use-realtime";

export function useShoppingItems() {
  const supabase = useSupabase();
  const { profile } = useUser();
  const pairId = profile?.pair_id;
  const queryKey = shoppingKeys.active(pairId ?? "");

  useRealtimeSubscription("shopping_items", queryKey, pairId);

  return useQuery({
    queryKey,
    queryFn: () => getActiveShoppingItems(supabase),
    enabled: !!pairId,
  });
}

export function useAddShoppingItem() {
  const supabase = useSupabase();
  const { user, profile } = useUser();
  const queryClient = useQueryClient();
  const pairId = profile?.pair_id;

  return useMutation({
    mutationFn: (item: { name: string; quantity?: string; category?: string }) => {
      if (!pairId || !user) throw new Error("ペアに参加してください");
      return addShoppingItem(supabase, {
        ...item,
        pair_id: pairId,
        created_by: user.id,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: shoppingKeys.active(pairId ?? ""),
      });
    },
  });
}

export function useToggleShoppingItem() {
  const supabase = useSupabase();
  const { user } = useUser();
  const { profile } = useUser();
  const queryClient = useQueryClient();
  const pairId = profile?.pair_id;

  return useMutation({
    mutationFn: ({ itemId, isPurchased }: { itemId: string; isPurchased: boolean }) =>
      toggleShoppingItem(supabase, itemId, isPurchased, user?.id),
    onMutate: async ({ itemId, isPurchased }) => {
      const queryKey = shoppingKeys.active(pairId ?? "");
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData(queryKey);
      queryClient.setQueryData(queryKey, (old: { id: string; is_purchased: boolean }[] | undefined) =>
        old?.map((item) =>
          item.id === itemId ? { ...item, is_purchased: isPurchased } : item
        )
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      queryClient.setQueryData(
        shoppingKeys.active(pairId ?? ""),
        context?.previous
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: shoppingKeys.active(pairId ?? ""),
      });
    },
  });
}

export function useDeleteShoppingItem() {
  const supabase = useSupabase();
  const { profile } = useUser();
  const queryClient = useQueryClient();
  const pairId = profile?.pair_id;

  return useMutation({
    mutationFn: (itemId: string) => deleteShoppingItem(supabase, itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: shoppingKeys.active(pairId ?? ""),
      });
    },
  });
}
