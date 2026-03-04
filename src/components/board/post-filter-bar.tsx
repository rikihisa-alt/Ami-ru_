"use client";

import { POST_TAGS } from "@/components/board/post-form";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Search, Pin } from "lucide-react";

interface PostFilterBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  activeTag: string | null;
  onTagChange: (tag: string | null) => void;
  showPinnedOnly: boolean;
  onPinnedToggle: () => void;
  unreadCount: number;
}

export function PostFilterBar({
  searchQuery,
  onSearchChange,
  activeTag,
  onTagChange,
  showPinnedOnly,
  onPinnedToggle,
  unreadCount,
}: PostFilterBarProps) {
  return (
    <div className="space-y-3 motion-safe:animate-prism-fade-up">
      {/* Search input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="投稿を検索..."
          className="h-9 rounded-xl pl-9 text-sm"
        />
        {/* Unread badge */}
        {unreadCount > 0 && (
          <Badge className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white">
            {unreadCount}
          </Badge>
        )}
      </div>

      {/* Tag chips + Pin toggle */}
      <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1 scrollbar-none">
        {/* All */}
        <button
          type="button"
          onClick={() => onTagChange(null)}
          className={cn(
            "shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors",
            activeTag === null
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          )}
        >
          すべて
        </button>

        {/* Tag filters */}
        {POST_TAGS.map((tag) => (
          <button
            key={tag.value}
            type="button"
            onClick={() =>
              onTagChange(activeTag === tag.value ? null : tag.value)
            }
            className={cn(
              "shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-all",
              activeTag === tag.value
                ? cn(tag.color, "ring-2 ring-primary ring-offset-1 ring-offset-background")
                : cn(tag.color, "opacity-60 hover:opacity-100")
            )}
          >
            {tag.label}
          </button>
        ))}

        {/* Pin filter */}
        <button
          type="button"
          onClick={onPinnedToggle}
          className={cn(
            "flex shrink-0 items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition-colors",
            showPinnedOnly
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          )}
        >
          <Pin className="h-3 w-3" />
          ピン留め
        </button>
      </div>
    </div>
  );
}
