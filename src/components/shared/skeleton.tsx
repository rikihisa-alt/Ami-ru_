"use client";

import { cn } from "@/lib/utils";

/* ──────────────────────────────────────────────
 * Skeleton — pulsing placeholder for loading state
 * ────────────────────────────────────────────── */
interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-lg bg-muted/70",
        className
      )}
      {...props}
    />
  );
}

/* ── List row skeleton（card内のリスト用） ── */
export function SkeletonRow({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-3 px-4 py-3", className)}>
      <Skeleton className="h-2 w-2 rounded-full" />
      <Skeleton className="h-4 flex-1 max-w-[60%]" />
      <Skeleton className="h-3 w-12" />
    </div>
  );
}

/* ── Card skeleton（独立カード用） ── */
export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-card p-4 space-y-3",
        className
      )}
    >
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-3 w-2/3" />
      <Skeleton className="h-3 w-1/2" />
    </div>
  );
}

/* ── Section skeleton（home画面のセクション用） ── */
export function SkeletonSection() {
  return (
    <section>
      <div className="flex items-center gap-2 px-1 pb-2">
        <Skeleton className="h-4 w-4 rounded" />
        <Skeleton className="h-3 w-20" />
      </div>
      <div className="rounded-xl border border-border bg-card divide-y divide-border/40">
        <SkeletonRow />
        <SkeletonRow />
      </div>
    </section>
  );
}
