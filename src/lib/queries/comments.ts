import type { SupabaseClient } from "@supabase/supabase-js";

export const commentKeys = {
  byPost: (pairId: string, postId: string) =>
    ["comments", pairId, postId] as const,
};

export async function getCommentsByPost(
  supabase: SupabaseClient,
  postId: string
) {
  const { data, error } = await supabase
    .from("post_comments")
    .select("*")
    .eq("post_id", postId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data;
}

export async function addComment(
  supabase: SupabaseClient,
  comment: {
    pair_id: string;
    post_id: string;
    body: string;
    created_by: string;
  }
) {
  const { data, error } = await supabase
    .from("post_comments")
    .insert(comment)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteComment(
  supabase: SupabaseClient,
  commentId: string
) {
  const { error } = await supabase
    .from("post_comments")
    .delete()
    .eq("id", commentId);
  if (error) throw error;
}
