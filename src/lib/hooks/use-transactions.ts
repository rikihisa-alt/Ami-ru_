"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabase, useUser } from "@/providers/supabase-provider";
import {
  transactionKeys,
  getMonthTransactions,
  addTransaction,
  updateTransaction,
  deleteTransaction,
} from "@/lib/queries/transactions";
import { useRealtimeSubscription } from "./use-realtime";

export function useMonthTransactions(year: number, month: number) {
  const supabase = useSupabase();
  const { profile } = useUser();
  const pairId = profile?.pair_id;
  const queryKey = transactionKeys.month(pairId ?? "", year, month);

  useRealtimeSubscription("money_transactions", queryKey, pairId);

  return useQuery({
    queryKey,
    queryFn: () => getMonthTransactions(supabase, year, month),
    enabled: !!pairId,
  });
}

export function useAddTransaction() {
  const supabase = useSupabase();
  const { user, profile } = useUser();
  const queryClient = useQueryClient();
  const pairId = profile?.pair_id;

  return useMutation({
    mutationFn: (tx: {
      type: "income" | "expense";
      amount: number;
      category?: string;
      is_confirmed?: boolean;
      scheduled_date?: string;
      recurrence?: string;
      memo?: string;
    }) => {
      if (!pairId || !user) throw new Error("ペアに参加してください");
      return addTransaction(supabase, {
        ...tx,
        pair_id: pairId,
        created_by: user.id,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: transactionKeys.all(pairId ?? ""),
      });
    },
  });
}

export function useUpdateTransaction() {
  const supabase = useSupabase();
  const { profile } = useUser();
  const queryClient = useQueryClient();
  const pairId = profile?.pair_id;

  return useMutation({
    mutationFn: ({
      txId,
      updates,
    }: {
      txId: string;
      updates: Parameters<typeof updateTransaction>[2];
    }) => updateTransaction(supabase, txId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: transactionKeys.all(pairId ?? ""),
      });
    },
  });
}

export function useDeleteTransaction() {
  const supabase = useSupabase();
  const { profile } = useUser();
  const queryClient = useQueryClient();
  const pairId = profile?.pair_id;

  return useMutation({
    mutationFn: (txId: string) => deleteTransaction(supabase, txId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: transactionKeys.all(pairId ?? ""),
      });
    },
  });
}
