"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabase, useUser } from "@/providers/supabase-provider";
import {
  moodKeys,
  getTodayMood,
  getWeekMoods,
  addMoodLog,
} from "@/lib/queries/moods";
import { useRealtimeSubscription } from "./use-realtime";

export function useTodayMood() {
  const supabase = useSupabase();
  const { user, profile } = useUser();
  const pairId = profile?.pair_id;

  useRealtimeSubscription("mood_logs", moodKeys.today(), pairId);

  return useQuery({
    queryKey: moodKeys.today(),
    queryFn: () => getTodayMood(supabase, user!.id),
    enabled: !!pairId && !!user,
  });
}

export function useWeekMoods() {
  const supabase = useSupabase();
  const { profile } = useUser();
  const pairId = profile?.pair_id;

  return useQuery({
    queryKey: moodKeys.week(),
    queryFn: () => getWeekMoods(supabase),
    enabled: !!pairId,
  });
}

export function useAddMoodLog() {
  const supabase = useSupabase();
  const { user, profile } = useUser();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (log: { mood: number; note?: string }) =>
      addMoodLog(supabase, {
        ...log,
        pair_id: profile!.pair_id!,
        created_by: user!.id,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: moodKeys.today() });
      queryClient.invalidateQueries({ queryKey: moodKeys.week() });
    },
  });
}
