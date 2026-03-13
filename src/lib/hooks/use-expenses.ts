"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabase, useUser } from "@/providers/supabase-provider";
import {
  expenseKeys,
  getMonthExpenses,
  addExpense,
  deleteExpense,
} from "@/lib/queries/expenses";
import { useRealtimeSubscription } from "./use-realtime";

export function useMonthExpenses(year: number, month: number) {
  const supabase = useSupabase();
  const { profile } = useUser();
  const pairId = profile?.pair_id;
  const queryKey = expenseKeys.month(pairId ?? "", year, month);

  useRealtimeSubscription("expenses", queryKey, pairId);

  return useQuery({
    queryKey,
    queryFn: () => getMonthExpenses(supabase, year, month),
    enabled: !!pairId,
  });
}

export function useAddExpense() {
  const supabase = useSupabase();
  const { user, profile } = useUser();
  const queryClient = useQueryClient();
  const pairId = profile?.pair_id;

  return useMutation({
    mutationFn: (expense: {
      date?: string;
      amount: number;
      category?: string;
      payer_id: string;
      bearer?: string;
      ratio_payer?: number;
      memo?: string;
    }) => {
      if (!pairId || !user) throw new Error("ペアに参加してください");
      return addExpense(supabase, {
        ...expense,
        pair_id: pairId,
        created_by: user.id,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: expenseKeys.all(pairId ?? ""),
      });
    },
  });
}

export function useDeleteExpense() {
  const supabase = useSupabase();
  const { profile } = useUser();
  const queryClient = useQueryClient();
  const pairId = profile?.pair_id;

  return useMutation({
    mutationFn: (expenseId: string) => deleteExpense(supabase, expenseId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: expenseKeys.all(pairId ?? ""),
      });
    },
  });
}
