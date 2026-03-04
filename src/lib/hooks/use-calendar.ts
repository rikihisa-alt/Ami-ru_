"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabase, useUser } from "@/providers/supabase-provider";
import {
  calendarKeys,
  getMonthEvents,
  addCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent,
} from "@/lib/queries/calendar";
import { useRealtimeSubscription } from "./use-realtime";

export function useMonthEvents(year: number, month: number) {
  const supabase = useSupabase();
  const { profile } = useUser();
  const pairId = profile?.pair_id;
  const queryKey = calendarKeys.month(pairId ?? "", year, month);

  useRealtimeSubscription("calendar_events", queryKey, pairId);

  return useQuery({
    queryKey,
    queryFn: () => getMonthEvents(supabase, year, month),
    enabled: !!pairId,
  });
}

export function useAddCalendarEvent() {
  const supabase = useSupabase();
  const { user, profile } = useUser();
  const queryClient = useQueryClient();
  const pairId = profile?.pair_id;

  return useMutation({
    mutationFn: (event: {
      title: string;
      description?: string;
      is_all_day?: boolean;
      start_at: string;
      end_at?: string;
      location?: string;
      source_place_id?: string;
      color?: string;
      assignee_id?: string | null;
    }) =>
      addCalendarEvent(supabase, {
        ...event,
        pair_id: pairId!,
        created_by: user!.id,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: calendarKeys.all(pairId!),
      });
    },
  });
}

export function useUpdateCalendarEvent() {
  const supabase = useSupabase();
  const { profile } = useUser();
  const queryClient = useQueryClient();
  const pairId = profile?.pair_id;

  return useMutation({
    mutationFn: ({
      eventId,
      updates,
    }: {
      eventId: string;
      updates: Parameters<typeof updateCalendarEvent>[2];
    }) => updateCalendarEvent(supabase, eventId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: calendarKeys.all(pairId!),
      });
    },
  });
}

export function useDeleteCalendarEvent() {
  const supabase = useSupabase();
  const { profile } = useUser();
  const queryClient = useQueryClient();
  const pairId = profile?.pair_id;

  return useMutation({
    mutationFn: (eventId: string) => deleteCalendarEvent(supabase, eventId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: calendarKeys.all(pairId!),
      });
    },
  });
}
