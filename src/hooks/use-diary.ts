import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabase, useUser } from "@/providers/supabase-provider";
import {
  diaryKeys,
  getDiaryEntries,
  addDiaryEntry,
  updateDiaryEntry,
  deleteDiaryEntry,
} from "@/lib/queries/diary";

export function useDiaryEntries(year: number, month: number) {
  const supabase = useSupabase();
  const { profile } = useUser();

  return useQuery({
    queryKey: diaryKeys.month(profile?.pair_id ?? "", year, month),
    queryFn: () => getDiaryEntries(supabase, year, month),
    enabled: !!profile?.pair_id,
  });
}

export function useAddDiaryEntry() {
  const supabase = useSupabase();
  const { user, profile } = useUser();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (entry: {
      title?: string;
      body: string;
      mood?: number;
      weather?: string;
      is_shared?: boolean;
      entry_date?: string;
    }) => {
      if (!profile?.pair_id || !user) throw new Error("ペアに参加してください");
      return addDiaryEntry(supabase, {
        ...entry,
        pair_id: profile.pair_id,
        created_by: user.id,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["diary"],
      });
    },
  });
}

export function useUpdateDiaryEntry() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      ...updates
    }: {
      id: string;
      title?: string | null;
      body?: string;
      mood?: number | null;
      weather?: string | null;
      is_shared?: boolean;
    }) => updateDiaryEntry(supabase, id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["diary"],
      });
    },
  });
}

export function useDeleteDiaryEntry() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteDiaryEntry(supabase, id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["diary"],
      });
    },
  });
}
