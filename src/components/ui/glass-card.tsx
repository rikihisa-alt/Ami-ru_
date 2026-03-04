"use client";

import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type GlassCardVariant = "default" | "elevated" | "flat" | "primary";

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: GlassCardVariant;
  hoverable?: boolean;
  /** Staggered animation index for lists */
  animationIndex?: number;
}

const variantStyles: Record<GlassCardVariant, string> = {
  default: "glass glass-highlight",
  elevated: "glass-elevated glass-highlight",
  flat: "bg-[var(--glass-bg)] border border-[var(--glass-border)]",
  primary: "glass-primary glass-highlight",
};

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, variant = "default", hoverable = false, animationIndex, children, style, ...props }, ref) => {
    const animDelay = animationIndex !== undefined
      ? { animationDelay: `${animationIndex * 60}ms` }
      : undefined;

    return (
      <div
        ref={ref}
        className={cn(
          "rounded-2xl p-4",
          variantStyles[variant],
          hoverable && [
            "transition-all duration-250 ease-out cursor-pointer",
            "hover:bg-[var(--glass-bg-hover)]",
            "hover:shadow-[var(--glass-shadow-lg)]",
            "hover:translate-y-[-2px]",
            "active:scale-[0.98] active:translate-y-0",
          ],
          animationIndex !== undefined && "motion-safe:animate-fade-in-up opacity-0",
          className
        )}
        style={{ ...style, ...animDelay }}
        {...props}
      >
        {children}
      </div>
    );
  }
);

GlassCard.displayName = "GlassCard";
