"use client";

import { PrismCard } from "@/components/ui/prism-card";
import { PrismButton } from "@/components/ui/prism-button";
import { formatYen } from "@/lib/utils/currency";
import { cn } from "@/lib/utils";
import { Pencil } from "lucide-react";

interface BalanceCardProps {
  balance: number;
  initialBalance: number;
  onEditInitialBalance?: () => void;
}

export function BalanceCard({
  balance,
  initialBalance,
  onEditInitialBalance,
}: BalanceCardProps) {
  const balanceColor =
    balance > 0
      ? "text-emerald-600 dark:text-emerald-400"
      : balance < 0
        ? "text-rose-600 dark:text-rose-400"
        : "text-foreground";

  const showHint = initialBalance === 0;

  return (
    <PrismCard variant="accent" animationIndex={0}>
      <div className="flex flex-col items-center gap-1">
        <p className="text-xs font-medium text-muted-foreground">
          今月の残高
        </p>
        <p className={cn("text-3xl font-bold tracking-tight", balanceColor)}>
          {formatYen(balance)}
        </p>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span>初期残高: {formatYen(initialBalance)}</span>
          {onEditInitialBalance && (
            <PrismButton
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={onEditInitialBalance}
            >
              <Pencil className="h-3 w-3" />
            </PrismButton>
          )}
        </div>
        {showHint && (
          <p className="mt-1 text-[11px] text-muted-foreground/70">
            初期残高を設定すると正確な残高が見えます
          </p>
        )}
      </div>
    </PrismCard>
  );
}
