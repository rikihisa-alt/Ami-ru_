"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabase, useUser } from "@/providers/supabase-provider";
import {
  pantryKeys,
  getActivePantryItems,
  addPantryItem,
  consumePantryItem,
  updatePantryItem,
  deletePantryItem,
  moveToShoppingList,
} from "@/lib/queries/pantry";
import { shoppingKeys } from "@/lib/queries/shopping";
import { useRealtimeSubscription } from "./use-realtime";

export function usePantryItems() {
  const supabase = useSupabase();
  const { profile } = useUser();
  const pairId = profile?.pair_id;
  const queryKey = pantryKeys.active(pairId ?? "");

  useRealtimeSubscription("pantry_items", queryKey, pairId);

  return useQuery({
    queryKey,
    queryFn: () => getActivePantryItems(supabase),
    enabled: !!pairId,
  });
}

export function useAddPantryItem() {
  const supabase = useSupabase();
  const { user, profile } = useUser();
  const queryClient = useQueryClient();
  const pairId = profile?.pair_id;

  return useMutation({
    mutationFn: (item: {
      name: string;
      quantity?: string;
      category?: string;
      purchase_date?: string;
      expiry_date?: string;
      memo?: string;
    }) =>
      addPantryItem(supabase, {
        ...item,
        pair_id: pairId!,
        created_by: user!.id,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: pantryKeys.active(pairId!),
      });
    },
  });
}

export function useConsumePantryItem() {
  const supabase = useSupabase();
  const { profile } = useUser();
  const queryClient = useQueryClient();
  const pairId = profile?.pair_id;

  return useMutation({
    mutationFn: (itemId: string) => consumePantryItem(supabase, itemId),
    onMutate: async (itemId) => {
      const queryKey = pantryKeys.active(pairId!);
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData(queryKey);
      queryClient.setQueryData(queryKey, (old: { id: string }[] | undefined) =>
        old?.filter((item) => item.id !== itemId)
      );
      return { previous };
    },
    onError: (_err, _itemId, context) => {
      queryClient.setQueryData(
        pantryKeys.active(pairId!),
        context?.previous
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: pantryKeys.active(pairId!),
      });
    },
  });
}

export function useUpdatePantryItem() {
  const supabase = useSupabase();
  const { profile } = useUser();
  const queryClient = useQueryClient();
  const pairId = profile?.pair_id;

  return useMutation({
    mutationFn: ({
      itemId,
      updates,
    }: {
      itemId: string;
      updates: Parameters<typeof updatePantryItem>[2];
    }) => updatePantryItem(supabase, itemId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: pantryKeys.active(pairId!),
      });
    },
  });
}

export function useDeletePantryItem() {
  const supabase = useSupabase();
  const { profile } = useUser();
  const queryClient = useQueryClient();
  const pairId = profile?.pair_id;

  return useMutation({
    mutationFn: (itemId: string) => deletePantryItem(supabase, itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: pantryKeys.active(pairId!),
      });
    },
  });
}

export function useMoveToShoppingList() {
  const supabase = useSupabase();
  const { user, profile } = useUser();
  const queryClient = useQueryClient();
  const pairId = profile?.pair_id;

  return useMutation({
    mutationFn: (item: { name: string; category?: string; source_pantry_id?: string }) =>
      moveToShoppingList(supabase, {
        ...item,
        pair_id: pairId!,
        created_by: user!.id,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: shoppingKeys.active(pairId!),
      });
    },
  });
}
