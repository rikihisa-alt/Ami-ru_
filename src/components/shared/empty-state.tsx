"use client";

import { type LucideIcon } from "lucide-react";
import { PrismButton } from "@/components/ui/prism-button";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  iconColor?: string;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  iconColor,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center gap-3 py-16 motion-safe:animate-prism-fade-up ${className ?? ""}`}
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
        <Icon className={`h-8 w-8 ${iconColor ?? "text-muted-foreground/50"}`} />
      </div>
      <p className="font-medium text-foreground">{title}</p>
      {description && (
        <p className="max-w-[240px] text-center text-sm text-muted-foreground">
          {description}
        </p>
      )}
      {action && (
        <PrismButton
          variant="secondary"
          size="sm"
          onClick={action.onClick}
          className="mt-2"
        >
          {action.label}
        </PrismButton>
      )}
    </div>
  );
}
