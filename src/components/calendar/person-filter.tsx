"use client";

import { cn } from "@/lib/utils";

type FilterValue = "all" | "mine" | "partner";

interface PersonFilterProps {
  value: FilterValue;
  onChange: (value: FilterValue) => void;
}

const OPTIONS: { value: FilterValue; label: string }[] = [
  { value: "all", label: "両方" },
  { value: "mine", label: "自分" },
  { value: "partner", label: "相手" },
];

export function PersonFilter({ value, onChange }: PersonFilterProps) {
  return (
    <div className="flex h-9 items-center gap-1 rounded-xl bg-muted p-1">
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={cn(
            "flex-1 rounded-lg px-3 py-1 text-xs font-medium transition-all duration-200",
            value === opt.value
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
