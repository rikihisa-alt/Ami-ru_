"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "@/providers/supabase-provider";

export function useRealtimeSubscription(
  table: string,
  queryKey: readonly unknown[],
  pairId: string | null | undefined
) {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!pairId) return;

    const channel = supabase
      .channel(`${table}-${pairId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table,
          filter: `pair_id=eq.${pairId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, table, pairId, queryClient, queryKey]);
}
