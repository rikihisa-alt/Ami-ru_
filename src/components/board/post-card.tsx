"use client";

import { useState, useEffect } from "react";
import { PrismCard } from "@/components/ui/prism-card";
import { PrismButton } from "@/components/ui/prism-button";
import { POST_TAGS } from "@/components/board/post-form";
import { CommentThread } from "@/components/board/comment-thread";
import { formatRelative } from "@/lib/utils/date";
import { cn } from "@/lib/utils";
import {
  Pin,
  Pencil,
  Trash2,
  ChevronDown,
} from "lucide-react";

interface PostCardProps {
  post: {
    id: string;
    title: string | null;
    body: string;
    tags: string[];
    is_pinned: boolean;
    read_by: string[];
    created_by: string;
    created_at: string;
  };
  isUnread: boolean;
  userId: string;
  partnerName: string;
  onEdit: (post: {
    id: string;
    title: string | null;
    body: string;
    tags: string[];
  }) => void;
  onDelete: (postId: string) => void;
  onTogglePin: (postId: string, isPinned: boolean) => void;
  onMarkRead: (postId: string) => void;
  animationIndex?: number;
}

export function PostCard({
  post,
  isUnread,
  userId,
  partnerName,
  onEdit,
  onDelete,
  onTogglePin,
  onMarkRead,
  animationIndex,
}: PostCardProps) {
  const [expanded, setExpanded] = useState(false);
  const isMine = post.created_by === userId;
  const authorLabel = isMine ? "自分" : partnerName;

  // Display title or first line of body
  const displayTitle = post.title || post.body.split("\n")[0];

  // Resolve tag objects from tag values
  const postTags = (post.tags ?? [])
    .map((v) => POST_TAGS.find((t) => t.value === v))
    .filter(Boolean);

  // Auto-mark as read on expand
  useEffect(() => {
    if (expanded && isUnread) {
      onMarkRead(post.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expanded]);

  const handleToggle = () => {
    setExpanded((prev) => !prev);
  };

  return (
    <div className="relative flex gap-3">
      {/* Timeline line */}
      <div className="relative flex flex-col items-center">
        {/* Dot */}
        <div
          className={cn(
            "mt-5 h-2.5 w-2.5 shrink-0 rounded-full",
            isUnread ? "bg-primary" : "bg-border"
          )}
        />
        {/* Vertical connector */}
        <div className="w-[2px] flex-1 bg-border" />
      </div>

      {/* Card */}
      <div className="min-w-0 flex-1 pb-3">
        <PrismCard
          variant="flat"
          hoverable
          animationIndex={animationIndex}
          className={cn(
            "cursor-pointer transition-shadow",
            expanded && "shadow-md"
          )}
          onClick={handleToggle}
        >
          {/* ── Header row ── */}
          <div className="flex items-start gap-2">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                {/* Pin */}
                {post.is_pinned && (
                  <Pin className="h-3 w-3 shrink-0 -rotate-45 text-primary" />
                )}

                {/* Title / first line */}
                <span
                  className={cn(
                    "truncate text-sm font-semibold leading-tight",
                    !post.title && "text-muted-foreground"
                  )}
                >
                  {displayTitle}
                </span>

                {/* Unread dot */}
                {isUnread && (
                  <span className="ml-1 inline-block h-2 w-2 shrink-0 rounded-full bg-red-500" />
                )}
              </div>

              {/* Tags */}
              {postTags.length > 0 && (
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {postTags.map((tag) => (
                    <span
                      key={tag!.value}
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[10px] font-medium",
                        tag!.color
                      )}
                    >
                      {tag!.label}
                    </span>
                  ))}
                </div>
              )}

              {/* Meta */}
              <div className="mt-1.5 flex items-center gap-2 text-[11px] text-muted-foreground">
                <span>{authorLabel}</span>
                <span className="text-muted-foreground/50">|</span>
                <span>{formatRelative(post.created_at)}</span>
              </div>
            </div>

            {/* Expand chevron */}
            <ChevronDown
              className={cn(
                "mt-0.5 h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200",
                expanded && "rotate-180"
              )}
            />
          </div>

          {/* ── Expanded content ── */}
          {expanded && (
            <div
              className="mt-3 border-t border-border pt-3"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Full body */}
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                {post.body}
              </p>

              {/* Action buttons */}
              <div className="mt-3 flex items-center gap-1">
                <PrismButton
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    onTogglePin(post.id, !post.is_pinned)
                  }
                  className="h-8 gap-1.5 text-xs"
                >
                  <Pin
                    className={cn(
                      "h-3.5 w-3.5",
                      post.is_pinned && "text-primary"
                    )}
                  />
                  {post.is_pinned ? "ピン解除" : "ピン留め"}
                </PrismButton>

                {isMine && (
                  <>
                    <PrismButton
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        onEdit({
                          id: post.id,
                          title: post.title,
                          body: post.body,
                          tags: post.tags ?? [],
                        })
                      }
                      className="h-8 gap-1.5 text-xs"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      編集
                    </PrismButton>

                    <PrismButton
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(post.id)}
                      className="h-8 gap-1.5 text-xs text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      削除
                    </PrismButton>
                  </>
                )}
              </div>

              {/* Comment thread */}
              <CommentThread
                postId={post.id}
                userId={userId}
                partnerName={partnerName}
              />
            </div>
          )}
        </PrismCard>
      </div>
    </div>
  );
}
