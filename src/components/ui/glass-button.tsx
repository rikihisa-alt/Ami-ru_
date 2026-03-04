"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type GlassButtonVariant = "primary" | "soft" | "ghost" | "pill" | "toggle" | "fab";
type GlassButtonSize = "sm" | "md" | "lg" | "icon";

interface GlassButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: GlassButtonVariant;
  size?: GlassButtonSize;
  active?: boolean; // for toggle variant
}

const variantStyles: Record<GlassButtonVariant, string> = {
  primary: [
    "glass-primary glass-highlight",
    "text-primary font-medium",
    "hover:shadow-[0_4px_16px_rgba(200,121,111,0.15)]",
    "hover:translate-y-[-1px]",
    "active:scale-[0.97] active:translate-y-0",
  ].join(" "),

  soft: [
    "glass glass-highlight",
    "text-foreground font-medium",
    "hover:bg-[var(--glass-bg-hover)]",
    "hover:shadow-[var(--glass-shadow-lg)]",
    "hover:translate-y-[-1px]",
    "active:scale-[0.97] active:translate-y-0",
  ].join(" "),

  ghost: [
    "bg-transparent border-transparent",
    "text-muted-foreground",
    "hover:bg-[var(--glass-bg)]",
    "hover:text-foreground",
    "active:scale-[0.97]",
  ].join(" "),

  pill: [
    "glass glass-highlight rounded-full",
    "text-foreground font-medium",
    "hover:bg-[var(--glass-bg-hover)]",
    "hover:translate-y-[-1px]",
    "active:scale-[0.97] active:translate-y-0",
  ].join(" "),

  toggle: [
    "glass",
    "text-muted-foreground font-medium",
    "hover:bg-[var(--glass-bg-hover)]",
    "active:scale-[0.97]",
    "data-[active=true]:bg-[var(--glass-primary-bg)]",
    "data-[active=true]:text-primary",
    "data-[active=true]:border-primary/20",
  ].join(" "),

  fab: [
    "bg-primary text-primary-foreground",
    "shadow-[0_4px_20px_rgba(200,121,111,0.25)]",
    "rounded-full",
    "hover:translate-y-[-2px]",
    "hover:shadow-[0_8px_28px_rgba(200,121,111,0.30)]",
    "active:scale-[0.95] active:translate-y-0",
  ].join(" "),
};

const sizeStyles: Record<GlassButtonSize, string> = {
  sm: "h-8 px-3 text-xs gap-1.5",
  md: "h-10 px-4 text-sm gap-2",
  lg: "h-12 px-6 text-base gap-2.5",
  icon: "h-10 w-10 p-0",
};

export const GlassButton = forwardRef<HTMLButtonElement, GlassButtonProps>(
  ({ className, variant = "soft", size = "md", active, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        data-active={active}
        className={cn(
          "inline-flex items-center justify-center",
          "rounded-2xl",
          "transition-all duration-250 ease-out",
          "motion-safe:transition-all",
          "outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-2",
          "disabled:pointer-events-none disabled:opacity-40",
          "select-none cursor-pointer",
          variantStyles[variant],
          sizeStyles[size],
          variant === "pill" && "rounded-full",
          variant === "fab" && "h-14 w-14 p-0",
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

GlassButton.displayName = "GlassButton";
