"use client";

import { forwardRef, type HTMLAttributes } from "react";
import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";
import { useMotionLevel } from "@/lib/hooks/use-motion-level";

/* ──────────────────────────────────────────────
 * PrismCard — CardFloatLift
 * ──────────────────────────────────────────────
 *  ● ふわっと浮く hover / タップ
 *  ● Staggered fade-in on mount
 *  ● variant: surface / elevated / flat / accent
 * ────────────────────────────────────────────── */

type PrismCardVariant = "surface" | "elevated" | "flat" | "accent";

interface PrismCardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: PrismCardVariant;
  /** Enable hover float lift */
  hoverable?: boolean;
  /** Staggered animation index for lists */
  animationIndex?: number;
  /** Use as a link card (cursor pointer) */
  asLink?: boolean;
}

const variantStyles: Record<PrismCardVariant, string> = {
  surface: "prism-surface",
  elevated: "prism-surface-elevated",
  flat: "bg-card border border-border rounded-2xl",
  accent:
    "bg-[var(--glass-primary-bg)] border border-[var(--prism-surface-border)] rounded-2xl backdrop-blur-sm",
};

const SPRING = {
  type: "spring" as const,
  stiffness: 520,
  damping: 34,
  mass: 0.8,
};

export const PrismCard = forwardRef<HTMLDivElement, PrismCardProps>(
  (
    {
      className,
      variant = "surface",
      hoverable = false,
      animationIndex,
      asLink = false,
      children,
      style,
      ...props
    },
    ref
  ) => {
    const { allows } = useMotionLevel();
    const animEnabled = allows(1);

    // Stagger delay
    const staggerDelay =
      animationIndex !== undefined ? animationIndex * 0.06 : 0;

    if (animEnabled) {
      const motionProps: HTMLMotionProps<"div"> = {
        initial: { opacity: 0, y: 8, scale: 0.98 },
        animate: { opacity: 1, y: 0, scale: 1 },
        transition: { ...SPRING, delay: staggerDelay },
        ...(hoverable
          ? {
              whileHover: {
                y: -2,
                boxShadow:
                  "0 8px 24px rgba(0,0,0,0.08)",
                transition: { duration: 0.25 },
              },
              whileTap: {
                scale: 0.98,
                y: 0,
                transition: { duration: 0.1 },
              },
            }
          : {}),
      };

      return (
        <motion.div
          ref={ref}
          className={cn(
            "p-4",
            variantStyles[variant],
            hoverable && "cursor-pointer",
            asLink && "cursor-pointer",
            className
          )}
          style={style}
          {...motionProps}
          {...(props as Record<string, unknown>)}
        >
          {children}
        </motion.div>
      );
    }

    // No animation
    return (
      <div
        ref={ref}
        className={cn(
          "p-4",
          variantStyles[variant],
          hoverable && "prism-lift cursor-pointer",
          asLink && "cursor-pointer",
          className
        )}
        style={style}
        {...props}
      >
        {children}
      </div>
    );
  }
);

PrismCard.displayName = "PrismCard";
