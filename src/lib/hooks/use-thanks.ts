"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabase, useUser } from "@/providers/supabase-provider";
import {
  thanksKeys,
  getTodayThanks,
  getWeekThanks,
  addThanksLog,
} from "@/lib/queries/thanks";
import { useRealtimeSubscription } from "./use-realtime";

export function useTodayThanks() {
  const supabase = useSupabase();
  const { profile } = useUser();
  const pairId = profile?.pair_id;

  useRealtimeSubscription("thanks_logs", thanksKeys.today(), pairId);

  return useQuery({
    queryKey: thanksKeys.today(),
    queryFn: () => getTodayThanks(supabase),
    enabled: !!pairId,
  });
}

export function useWeekThanks() {
  const supabase = useSupabase();
  const { profile } = useUser();
  const pairId = profile?.pair_id;

  return useQuery({
    queryKey: thanksKeys.week(),
    queryFn: () => getWeekThanks(supabase),
    enabled: !!pairId,
  });
}

export function useAddThanksLog() {
  const supabase = useSupabase();
  const { user, profile } = useUser();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (log: { message?: string }) => {
      if (!profile?.pair_id || !user) throw new Error("ペアに参加してください");
      return addThanksLog(supabase, {
        ...log,
        pair_id: profile.pair_id,
        created_by: user.id,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: thanksKeys.today() });
      queryClient.invalidateQueries({ queryKey: thanksKeys.week() });
    },
  });
}
