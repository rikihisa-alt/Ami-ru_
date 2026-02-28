"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabase, useUser } from "@/providers/supabase-provider";
import { postKeys, getPosts, addPost, updatePost, markPostAsRead, deletePost } from "@/lib/queries/posts";
import { useRealtimeSubscription } from "@/lib/hooks/use-realtime";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { toast } from "sonner";
import { formatRelative } from "@/lib/utils/date";
import { Plus, Pin, Trash2, MessageSquare } from "lucide-react";

export default function BulletinView() {
  const supabase = useSupabase();
  const { user, profile } = useUser();
  const queryClient = useQueryClient();
  const pairId = profile?.pair_id;
  const queryKey = postKeys.all(pairId ?? "");

  useRealtimeSubscription("posts", queryKey, pairId);

  const { data: posts, isLoading } = useQuery({
    queryKey,
    queryFn: () => getPosts(supabase),
    enabled: !!pairId,
  });

  const addMutation = useMutation({
    mutationFn: (post: { title?: string; body: string }) =>
      addPost(supabase, { ...post, pair_id: pairId!, created_by: user!.id }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  const pinMutation = useMutation({
    mutationFn: ({ postId, isPinned }: { postId: string; isPinned: boolean }) =>
      updatePost(supabase, postId, { is_pinned: isPinned }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  const deleteMutation = useMutation({
    mutationFn: (postId: string) => deletePost(supabase, postId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  const [formOpen, setFormOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim()) return;
    try {
      await addMutation.mutateAsync({
        title: title.trim() || undefined,
        body: body.trim(),
      });
      toast.success("投稿しました");
      setTitle("");
      setBody("");
      setFormOpen(false);
    } catch {
      toast.error("投稿に失敗しました");
    }
  };

  const handleRead = async (postId: string) => {
    if (!user) return;
    await markPostAsRead(supabase, postId, user.id);
    queryClient.invalidateQueries({ queryKey });
  };

  return (
    <div className="mt-4 space-y-3">
      {isLoading ? (
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-2xl bg-pink-50 dark:bg-pink-950/30" />
          ))}
        </div>
      ) : posts?.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-muted-foreground">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-pink-50 dark:bg-pink-950/30">
            <MessageSquare className="h-8 w-8 text-pink-300" />
          </div>
          <p className="font-medium">投稿はありません</p>
        </div>
      ) : (
        posts?.map(
          (post: {
            id: string;
            title: string | null;
            body: string;
            is_pinned: boolean;
            read_by: string[];
            created_by: string;
            created_at: string;
          }) => {
            const isRead = post.read_by?.includes(user?.id ?? "");
            return (
              <Card
                key={post.id}
                className="border-pink-100/60 p-3 dark:border-pink-900/20"
                onClick={() => !isRead && handleRead(post.id)}
              >
                <div className="flex items-start gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      {post.is_pinned && (
                        <Pin className="h-3 w-3 text-pink-400" />
                      )}
                      {post.title && (
                        <span className="font-medium">{post.title}</span>
                      )}
                      {!isRead && (
                        <Badge className="h-4 bg-pink-400 text-[10px] text-white">未読</Badge>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                      {post.body}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {formatRelative(post.created_at)}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={(e) => {
                        e.stopPropagation();
                        pinMutation.mutate({
                          postId: post.id,
                          isPinned: !post.is_pinned,
                        });
                      }}
                    >
                      <Pin
                        className={`h-3 w-3 ${
                          post.is_pinned ? "text-pink-400" : ""
                        }`}
                      />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-red-400"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteMutation.mutate(post.id);
                        toast.success("削除しました");
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          }
        )
      )}

      <Sheet open={formOpen} onOpenChange={setFormOpen}>
        <SheetTrigger asChild>
          <Button
            size="icon"
            className="fixed bottom-20 right-4 z-40 h-14 w-14 rounded-full bg-gradient-to-br from-pink-400 to-purple-400 shadow-lg shadow-pink-200/50 hover:from-pink-500 hover:to-purple-500 dark:shadow-pink-900/30"
          >
            <Plus className="h-6 w-6 text-white" />
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="mx-auto max-w-md rounded-t-3xl border-t-pink-100 dark:border-t-pink-900/30">
          <SheetHeader>
            <SheetTitle className="text-pink-600 dark:text-pink-400">投稿する</SheetTitle>
          </SheetHeader>
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="postTitle">タイトル</Label>
              <Input
                id="postTitle"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="タイトル（任意）"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="postBody">本文 *</Label>
              <textarea
                id="postBody"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="伝えたいことを書いてください"
                rows={4}
                className="w-full rounded-xl border border-pink-100 bg-background px-3 py-2 text-sm focus:border-pink-300 focus:outline-none focus:ring-2 focus:ring-pink-200 dark:border-pink-900/30"
                required
              />
            </div>
            <Button type="submit" className="w-full bg-gradient-to-r from-pink-400 to-purple-400 hover:from-pink-500 hover:to-purple-500" disabled={addMutation.isPending}>
              {addMutation.isPending ? "投稿中..." : "投稿する"}
            </Button>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
}
