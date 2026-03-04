"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabase, useUser } from "@/providers/supabase-provider";
import {
  commentKeys,
  getCommentsByPost,
  addComment,
  deleteComment,
} from "@/lib/queries/comments";

export function useComments(postId: string) {
  const supabase = useSupabase();
  const { profile } = useUser();
  const pairId = profile?.pair_id;

  return useQuery({
    queryKey: commentKeys.byPost(pairId ?? "", postId),
    queryFn: () => getCommentsByPost(supabase, postId),
    enabled: !!pairId && !!postId,
  });
}

export function useAddComment() {
  const supabase = useSupabase();
  const { user, profile } = useUser();
  const queryClient = useQueryClient();
  const pairId = profile?.pair_id;

  return useMutation({
    mutationFn: (input: { post_id: string; body: string }) =>
      addComment(supabase, {
        ...input,
        pair_id: pairId!,
        created_by: user!.id,
      }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: commentKeys.byPost(pairId!, variables.post_id),
      });
    },
  });
}

export function useDeleteComment() {
  const supabase = useSupabase();
  const { profile } = useUser();
  const queryClient = useQueryClient();
  const pairId = profile?.pair_id;

  return useMutation({
    mutationFn: ({
      commentId,
      postId,
    }: {
      commentId: string;
      postId: string;
    }) => deleteComment(supabase, commentId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: commentKeys.byPost(pairId!, variables.postId),
      });
    },
  });
}
