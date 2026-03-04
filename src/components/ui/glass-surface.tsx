"use client";

import { forwardRef, type ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";

/* ──────────────────────────────────────────────
 * GlassSurface
 * ──────────────────────────────────────────────
 * CSS .glass / .glass-elevated / .glass-dock のラッパー。
 * variant で切り替え、追加の className を重ねられる。
 * ────────────────────────────────────────────── */

type Variant = "default" | "elevated" | "dock";

const variantClass: Record<Variant, string> = {
  default: "glass",
  elevated: "glass-elevated",
  dock: "glass-dock",
};

interface GlassSurfaceProps extends ComponentPropsWithoutRef<"div"> {
  /** ガラス強度の種類 */
  variant?: Variant;
  /** 角丸（デフォルト: rounded-2xl） */
  radius?: string;
}

export const GlassSurface = forwardRef<HTMLDivElement, GlassSurfaceProps>(
  ({ variant = "default", radius = "rounded-2xl", className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(variantClass[variant], radius, className)}
      {...props}
    >
      {children}
    </div>
  ),
);
GlassSurface.displayName = "GlassSurface";
