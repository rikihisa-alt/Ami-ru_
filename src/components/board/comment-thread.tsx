"use client";

import { useState, useRef, useEffect } from "react";
import {
  useComments,
  useAddComment,
  useDeleteComment,
} from "@/lib/hooks/use-comments";
import { PrismButton } from "@/components/ui/prism-button";
import { Input } from "@/components/ui/input";
import { formatRelative } from "@/lib/utils/date";
import { cn } from "@/lib/utils";
import { Send, Trash2, MessageCircle } from "lucide-react";

interface CommentThreadProps {
  postId: string;
  userId: string;
  partnerName: string;
}

export function CommentThread({
  postId,
  userId,
  partnerName,
}: CommentThreadProps) {
  const { data: comments, isLoading } = useComments(postId);
  const addComment = useAddComment();
  const deleteComment = useDeleteComment();
  const [body, setBody] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new comments appear
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [comments?.length]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim()) return;

    try {
      await addComment.mutateAsync({ post_id: postId, body: body.trim() });
      setBody("");
    } catch {
      // silently fail — mutation error handled by react-query
    }
  };

  return (
    <div className="mt-3 space-y-3">
      {/* Divider */}
      <div className="flex items-center gap-2">
        <MessageCircle className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-xs font-medium text-muted-foreground">
          コメント {comments?.length ? `(${comments.length})` : ""}
        </span>
      </div>

      {/* Comment list */}
      <div
        ref={scrollRef}
        className="max-h-[240px] space-y-2 overflow-y-auto pr-1"
      >
        {isLoading ? (
          <div className="space-y-2">
            {[...Array(2)].map((_, i) => (
              <div
                key={i}
                className="h-10 animate-pulse rounded-xl bg-muted"
              />
            ))}
          </div>
        ) : !comments?.length ? (
          <p className="py-3 text-center text-xs text-muted-foreground">
            コメントはまだありません
          </p>
        ) : (
          comments.map(
            (comment: {
              id: string;
              body: string;
              created_by: string;
              created_at: string;
            }) => {
              const isMine = comment.created_by === userId;
              return (
                <div
                  key={comment.id}
                  className={cn(
                    "group relative rounded-xl px-3 py-2",
                    isMine
                      ? "ml-4 bg-primary/10"
                      : "mr-4 bg-muted"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold text-muted-foreground">
                      {isMine ? "自分" : partnerName}
                    </span>
                    <span className="text-[10px] text-muted-foreground/70">
                      {formatRelative(comment.created_at)}
                    </span>
                    {/* Delete button (own comments only) */}
                    {isMine && (
                      <button
                        type="button"
                        onClick={() =>
                          deleteComment.mutate({
                            commentId: comment.id,
                            postId,
                          })
                        }
                        className="ml-auto opacity-0 transition-opacity group-hover:opacity-100"
                        aria-label="コメントを削除"
                      >
                        <Trash2 className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                      </button>
                    )}
                  </div>
                  <p className="mt-0.5 text-sm leading-relaxed text-foreground">
                    {comment.body}
                  </p>
                </div>
              );
            }
          )
        )}
      </div>

      {/* Add comment form */}
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <Input
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="コメントを入力..."
          className="h-9 flex-1 rounded-xl text-sm"
        />
        <PrismButton
          type="submit"
          variant="primary"
          size="icon"
          className="h-9 w-9 shrink-0 rounded-xl"
          disabled={!body.trim() || addComment.isPending}
        >
          <Send className="h-4 w-4" />
        </PrismButton>
      </form>
    </div>
  );
}
