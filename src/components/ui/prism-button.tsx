"use client";

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useMotionLevel } from "@/lib/hooks/use-motion-level";

/* ──────────────────────────────────────────────
 * PrismButton — ButtonMagneticPress
 * ──────────────────────────────────────────────
 *  押すと吸い付くように沈んで戻る
 *  variant: primary / secondary / ghost / danger
 *  size: sm / md / lg / icon
 * ────────────────────────────────────────────── */

type PrismButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type PrismButtonSize = "sm" | "md" | "lg" | "icon";

interface PrismButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: PrismButtonVariant;
  size?: PrismButtonSize;
  shimmer?: boolean;
  children?: ReactNode;
}

const variantStyles: Record<PrismButtonVariant, string> = {
  primary:
    "bg-primary text-primary-foreground shadow-[var(--prism-shadow-sm)] hover:shadow-[var(--prism-shadow-md)]",
  secondary:
    "bg-secondary text-secondary-foreground hover:bg-secondary/80",
  ghost:
    "text-muted-foreground hover:bg-secondary hover:text-foreground",
  danger:
    "bg-destructive text-white hover:bg-destructive/90",
};

const sizeStyles: Record<PrismButtonSize, string> = {
  sm: "h-8 px-3 text-xs gap-1.5",
  md: "h-10 px-4 text-sm gap-2",
  lg: "h-12 px-6 text-base gap-2.5",
  icon: "h-10 w-10 p-0 justify-center",
};

export const PrismButton = forwardRef<HTMLButtonElement, PrismButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      shimmer = false,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const { allows } = useMotionLevel();
    const animEnabled = allows(1);

    const classes = cn(
      "inline-flex items-center justify-center whitespace-nowrap rounded-xl font-medium",
      "transition-colors duration-200",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      "disabled:pointer-events-none disabled:opacity-50",
      variantStyles[variant],
      sizeStyles[size],
      shimmer && "prism-shimmer",
      className
    );

    if (animEnabled) {
      return (
        <motion.button
          ref={ref}
          className={classes}
          disabled={disabled}
          whileTap={{ scale: 0.95, transition: { duration: 0.12 } }}
          whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
          {...(props as Record<string, unknown>)}
        >
          {children}
        </motion.button>
      );
    }

    return (
      <button
        ref={ref}
        className={cn(classes, "prism-press")}
        disabled={disabled}
        {...props}
      >
        {children}
      </button>
    );
  }
);

PrismButton.displayName = "PrismButton";
