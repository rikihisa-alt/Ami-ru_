"use client";

import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabase, useUser } from "@/providers/supabase-provider";
import { postKeys, addPost, updatePost } from "@/lib/queries/posts";
import { PrismButton } from "@/components/ui/prism-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";

/* ──────────────────────────────────────────────
 * POST_TAGS — tag definitions for bulletin board
 * ────────────────────────────────────────────── */
export const POST_TAGS = [
  {
    value: "important",
    label: "重要",
    color:
      "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400",
  },
  {
    value: "request",
    label: "お願い",
    color:
      "bg-orange-100 text-orange-700 dark:bg-orange-950/40 dark:text-orange-400",
  },
  {
    value: "idea",
    label: "アイデア",
    color:
      "bg-violet-100 text-violet-700 dark:bg-violet-950/40 dark:text-violet-400",
  },
  {
    value: "question",
    label: "質問",
    color:
      "bg-sky-100 text-sky-700 dark:bg-sky-950/40 dark:text-sky-400",
  },
  {
    value: "memo",
    label: "メモ",
    color: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400",
  },
] as const;

export type PostTagValue = (typeof POST_TAGS)[number]["value"];

/* ──────────────────────────────────────────────
 * PostForm
 * ────────────────────────────────────────────── */
interface PostFormProps {
  editPost?: {
    id: string;
    title: string | null;
    body: string;
    tags: string[];
  };
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function PostForm({ editPost, open, onOpenChange }: PostFormProps) {
  const supabase = useSupabase();
  const { user, profile } = useUser();
  const queryClient = useQueryClient();
  const pairId = profile?.pair_id;
  const queryKey = postKeys.all(pairId ?? "");

  const isEdit = !!editPost;

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Sync form when editPost changes
  useEffect(() => {
    if (editPost) {
      setTitle(editPost.title ?? "");
      setBody(editPost.body);
      setSelectedTags(editPost.tags ?? []);
    } else {
      setTitle("");
      setBody("");
      setSelectedTags([]);
    }
  }, [editPost]);

  const addMutation = useMutation({
    mutationFn: (post: { title?: string; body: string; tags?: string[] }) => {
      if (!pairId || !user) throw new Error("ペアに参加してください");
      return addPost(supabase, {
        ...post,
        pair_id: pairId,
        created_by: user.id,
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  const updateMutation = useMutation({
    mutationFn: (data: {
      postId: string;
      updates: { title?: string | null; body?: string; tags?: string[] };
    }) => updatePost(supabase, data.postId, data.updates),
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  const isPending = addMutation.isPending || updateMutation.isPending;

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const resetForm = () => {
    setTitle("");
    setBody("");
    setSelectedTags([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim()) return;

    try {
      if (isEdit && editPost) {
        await updateMutation.mutateAsync({
          postId: editPost.id,
          updates: {
            title: title.trim() || null,
            body: body.trim(),
            tags: selectedTags,
          },
        });
        toast.success("更新しました");
      } else {
        await addMutation.mutateAsync({
          title: title.trim() || undefined,
          body: body.trim(),
          tags: selectedTags.length > 0 ? selectedTags : undefined,
        });
        toast.success("投稿しました");
      }
      resetForm();
      onOpenChange?.(false);
    } catch {
      toast.error(isEdit ? "更新に失敗しました" : "投稿に失敗しました");
    }
  };

  const sheetContent = (
    <SheetContent side="bottom" className="mx-auto max-w-lg rounded-t-2xl">
      <SheetHeader>
        <SheetTitle>{isEdit ? "投稿を編集" : "投稿する"}</SheetTitle>
      </SheetHeader>
      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        {/* Title */}
        <div className="space-y-2">
          <Label htmlFor="postTitle">タイトル</Label>
          <Input
            id="postTitle"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="タイトル（任意）"
            className="rounded-xl"
          />
        </div>

        {/* Body */}
        <div className="space-y-2">
          <Label htmlFor="postBody">本文 *</Label>
          <textarea
            id="postBody"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="伝えたいことを書いてください"
            rows={4}
            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30"
            required
          />
        </div>

        {/* Tags */}
        <div className="space-y-2">
          <Label>タグ</Label>
          <div className="flex flex-wrap gap-2">
            {POST_TAGS.map((tag) => {
              const isSelected = selectedTags.includes(tag.value);
              return (
                <button
                  key={tag.value}
                  type="button"
                  onClick={() => toggleTag(tag.value)}
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-medium transition-all",
                    tag.color,
                    isSelected
                      ? "ring-2 ring-primary ring-offset-1 ring-offset-background"
                      : "opacity-60 hover:opacity-100"
                  )}
                >
                  {tag.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Submit */}
        <PrismButton type="submit" className="w-full" disabled={isPending}>
          {isPending
            ? isEdit
              ? "更新中..."
              : "投稿中..."
            : isEdit
              ? "更新する"
              : "投稿する"}
        </PrismButton>
      </form>
    </SheetContent>
  );

  // Edit mode: controlled externally (no FAB trigger)
  if (isEdit) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        {sheetContent}
      </Sheet>
    );
  }

  // Create mode: FAB trigger
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>
        <PrismButton
          size="icon"
          className="fixed bottom-20 right-4 z-40 h-14 w-14 rounded-full shadow-lg lg:bottom-8"
        >
          <Plus className="h-6 w-6" />
        </PrismButton>
      </SheetTrigger>
      {sheetContent}
    </Sheet>
  );
}
