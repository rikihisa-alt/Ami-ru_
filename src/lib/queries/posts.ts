import type { SupabaseClient } from "@supabase/supabase-js";

export const postKeys = {
  all: (pairId: string) => ["posts", pairId] as const,
};

export async function getPosts(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .order("is_pinned", { ascending: false })
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function addPost(
  supabase: SupabaseClient,
  post: {
    pair_id: string;
    title?: string;
    body: string;
    image_url?: string;
    tags?: string[];
    created_by: string;
  }
) {
  const { data, error } = await supabase
    .from("posts")
    .insert(post)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updatePost(
  supabase: SupabaseClient,
  postId: string,
  updates: {
    title?: string | null;
    body?: string;
    is_pinned?: boolean;
    tags?: string[];
  }
) {
  const { error } = await supabase
    .from("posts")
    .update(updates)
    .eq("id", postId);
  if (error) throw error;
}

export async function markPostAsRead(
  supabase: SupabaseClient,
  postId: string,
  userId: string
) {
  // Append userId to read_by array if not already present
  const { data: post } = await supabase
    .from("posts")
    .select("read_by")
    .eq("id", postId)
    .single();

  if (post && !post.read_by?.includes(userId)) {
    const { error } = await supabase
      .from("posts")
      .update({ read_by: [...(post.read_by || []), userId] })
      .eq("id", postId);
    if (error) throw error;
  }
}

export async function deletePost(supabase: SupabaseClient, postId: string) {
  const { error } = await supabase.from("posts").delete().eq("id", postId);
  if (error) throw error;
}
