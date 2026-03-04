"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabase, useUser } from "@/providers/supabase-provider";
import {
  postKeys,
  getPosts,
  updatePost,
  markPostAsRead,
  deletePost,
} from "@/lib/queries/posts";
import { useRealtimeSubscription } from "@/lib/hooks/use-realtime";
import { PostCard } from "@/components/board/post-card";
import { PostFilterBar } from "@/components/board/post-filter-bar";
import { PostForm } from "@/components/board/post-form";
import { EmptyState } from "@/components/shared/empty-state";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { toast } from "sonner";
import { MessageSquare } from "lucide-react";

type Post = {
  id: string;
  title: string | null;
  body: string;
  tags: string[];
  is_pinned: boolean;
  read_by: string[];
  created_by: string;
  created_at: string;
};

export default function BulletinView() {
  const supabase = useSupabase();
  const { user, profile } = useUser();
  const queryClient = useQueryClient();
  const pairId = profile?.pair_id;
  const queryKey = postKeys.all(pairId ?? "");

  useRealtimeSubscription("posts", queryKey, pairId);

  /* ── Data ── */
  const { data: posts } = useQuery({
    queryKey,
    queryFn: () => getPosts(supabase),
    enabled: !!pairId,
  });

  /* ── Partner name ── */
  const [partnerName, setPartnerName] = useState("パートナー");

  useEffect(() => {
    if (!pairId || !user) return;
    supabase
      .from("profiles")
      .select("id, display_name")
      .eq("pair_id", pairId)
      .neq("id", user.id)
      .single()
      .then(({ data }) => {
        if (data?.display_name) setPartnerName(data.display_name);
      });
  }, [pairId, user, supabase]);

  /* ── Filter state ── */
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [showPinnedOnly, setShowPinnedOnly] = useState(false);

  /* ── Form state ── */
  const [formOpen, setFormOpen] = useState(false);
  const [editPost, setEditPost] = useState<{
    id: string;
    title: string | null;
    body: string;
    tags: string[];
  } | null>(null);

  /* ── Delete state ── */
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  /* ── Mutations ── */
  const pinMutation = useMutation({
    mutationFn: ({
      postId,
      isPinned,
    }: {
      postId: string;
      isPinned: boolean;
    }) => updatePost(supabase, postId, { is_pinned: isPinned }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  const deleteMutation = useMutation({
    mutationFn: (postId: string) => deletePost(supabase, postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success("削除しました");
    },
    onError: () => {
      // silent in demo mode
    },
  });

  /* ── Mark as read ── */
  const handleMarkRead = async (postId: string) => {
    if (!user) return;
    await markPostAsRead(supabase, postId, user.id);
    queryClient.invalidateQueries({ queryKey });
  };

  /* ── Filtered & sorted posts ── */
  const filteredPosts = useMemo(() => {
    if (!posts) return [];
    let result = posts as Post[];

    // Search filter (title + body)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          (p.title?.toLowerCase().includes(q) ?? false) ||
          p.body.toLowerCase().includes(q)
      );
    }

    // Tag filter
    if (activeTag) {
      result = result.filter((p) => p.tags?.includes(activeTag));
    }

    // Pin-only filter
    if (showPinnedOnly) {
      result = result.filter((p) => p.is_pinned);
    }

    // Sort: pinned first, then newest
    return [...result].sort((a, b) => {
      if (a.is_pinned !== b.is_pinned) return a.is_pinned ? -1 : 1;
      return (
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    });
  }, [posts, searchQuery, activeTag, showPinnedOnly]);

  /* ── Unread count ── */
  const unreadCount = useMemo(() => {
    if (!posts || !user) return 0;
    return (posts as Post[]).filter(
      (p) => !p.read_by?.includes(user.id)
    ).length;
  }, [posts, user]);

  /* ── Handlers ── */
  const handleEdit = (post: {
    id: string;
    title: string | null;
    body: string;
    tags: string[];
  }) => {
    setEditPost(post);
  };

  const handleEditOpenChange = (open: boolean) => {
    if (!open) setEditPost(null);
  };

  const handleDelete = (postId: string) => {
    setDeleteTarget(postId);
  };

  const handleConfirmDelete = () => {
    if (deleteTarget) {
      deleteMutation.mutate(deleteTarget);
      setDeleteTarget(null);
    }
  };

  const handleTogglePin = (postId: string, isPinned: boolean) => {
    pinMutation.mutate({ postId, isPinned });
    toast.success(isPinned ? "ピン留めしました" : "ピン留めを解除しました");
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2.5 motion-safe:animate-prism-fade-up">
        <MessageSquare className="h-5 w-5 text-violet-400" />
        <h1 className="text-xl font-bold tracking-tight text-foreground">
          掲示板
        </h1>
      </div>

      {/* Filter bar */}
      <PostFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeTag={activeTag}
        onTagChange={setActiveTag}
        showPinnedOnly={showPinnedOnly}
        onPinnedToggle={() => setShowPinnedOnly((v) => !v)}
        unreadCount={unreadCount}
      />

      {/* Post list */}
      {filteredPosts.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title={
            searchQuery || activeTag || showPinnedOnly
              ? "該当する投稿がありません"
              : "投稿はまだありません"
          }
          description={
            searchQuery || activeTag || showPinnedOnly
              ? "フィルターを変更してみてください"
              : "最初の投稿を作成してみましょう"
          }
          action={
            !searchQuery && !activeTag && !showPinnedOnly
              ? {
                  label: "投稿する",
                  onClick: () => setFormOpen(true),
                }
              : undefined
          }
          iconColor="text-violet-400/50"
        />
      ) : (
        <div>
          {filteredPosts.map((post, index) => (
            <PostCard
              key={post.id}
              post={post}
              isUnread={!post.read_by?.includes(user?.id ?? "")}
              userId={user?.id ?? ""}
              partnerName={partnerName}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onTogglePin={handleTogglePin}
              onMarkRead={handleMarkRead}
              animationIndex={index}
            />
          ))}
          {/* Timeline end cap */}
          <div className="flex gap-3">
            <div className="flex flex-col items-center">
              <div className="h-2 w-2 rounded-full bg-border" />
            </div>
          </div>
        </div>
      )}

      {/* Create form (FAB) */}
      <PostForm
        open={formOpen}
        onOpenChange={setFormOpen}
      />

      {/* Edit form (no FAB) */}
      {editPost && (
        <PostForm
          editPost={editPost}
          open={!!editPost}
          onOpenChange={handleEditOpenChange}
        />
      )}

      {/* Delete confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title="投稿を削除しますか？"
        description="この操作は取り消せません。コメントも一緒に削除されます。"
        confirmLabel="削除する"
        variant="danger"
        onConfirm={handleConfirmDelete}
        isPending={deleteMutation.isPending}
      />
    </div>
  );
}
