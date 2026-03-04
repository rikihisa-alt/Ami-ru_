"use client";

import { PrismCard } from "@/components/ui/prism-card";
import { PrismButton } from "@/components/ui/prism-button";
import { EmptyState } from "@/components/shared/empty-state";
import { formatYen } from "@/lib/utils/currency";
import { formatDate } from "@/lib/utils/date";
import { cn } from "@/lib/utils";
import {
  TrendingUp,
  TrendingDown,
  Pencil,
  Trash2,
  Receipt,
} from "lucide-react";

interface Transaction {
  id: string;
  type: "income" | "expense";
  amount: number;
  category: string | null;
  is_confirmed: boolean;
  scheduled_date: string | null;
  memo: string | null;
}

const INCOME_CATEGORY_LABELS: Record<string, string> = {
  salary: "給料",
  bonus: "ボーナス",
  side_income: "副収入",
  other: "その他",
};

const EXPENSE_TX_CATEGORY_LABELS: Record<string, string> = {
  rent: "家賃",
  utilities: "光熱費",
  communication: "通信費",
  insurance: "保険",
  subscription: "サブスク",
  other: "その他",
};

function getCategoryLabel(type: "income" | "expense", category: string | null): string {
  if (!category) return "";
  if (type === "income") {
    return INCOME_CATEGORY_LABELS[category] ?? category;
  }
  return EXPENSE_TX_CATEGORY_LABELS[category] ?? category;
}

interface TransactionListProps {
  transactions: Transaction[];
  onEdit: (tx: Transaction) => void;
  onDelete: (txId: string) => void;
}

export function TransactionList({
  transactions,
  onEdit,
  onDelete,
}: TransactionListProps) {
  if (!transactions.length) {
    return (
      <EmptyState
        icon={Receipt}
        title="収支データがありません"
        description="収入や固定費を登録して残高を管理しよう"
      />
    );
  }

  // Sort by scheduled_date ascending
  const sorted = [...transactions].sort((a, b) => {
    const dateA = a.scheduled_date ?? "";
    const dateB = b.scheduled_date ?? "";
    return dateA.localeCompare(dateB);
  });

  return (
    <div className="space-y-2">
      {sorted.map((tx, i) => {
        const isIncome = tx.type === "income";
        const icon = isIncome ? TrendingUp : TrendingDown;
        const Icon = icon;
        const iconColor = isIncome
          ? "text-emerald-500"
          : "text-rose-500";
        const amountColor = isIncome
          ? "text-emerald-600 dark:text-emerald-400"
          : "text-rose-600 dark:text-rose-400";
        const borderClass = tx.is_confirmed
          ? isIncome
            ? "border-l-emerald-500"
            : "border-l-rose-500"
          : "border-l-muted-foreground/40 border-dashed";

        return (
          <PrismCard
            key={tx.id}
            variant="flat"
            animationIndex={i}
            className={cn(
              "flex items-center gap-3 border-l-[3px] p-3",
              borderClass,
              !tx.is_confirmed && "opacity-75"
            )}
          >
            {/* Icon */}
            <div
              className={cn(
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
                isIncome
                  ? "bg-emerald-100 dark:bg-emerald-500/15"
                  : "bg-rose-100 dark:bg-rose-500/15"
              )}
            >
              <Icon className={cn("h-4 w-4", iconColor)} />
            </div>

            {/* Info */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className={cn("text-sm font-bold", amountColor)}>
                  {isIncome ? "+" : "-"}
                  {formatYen(tx.amount)}
                </span>
                {tx.category && (
                  <span className="truncate text-xs text-muted-foreground">
                    {getCategoryLabel(tx.type, tx.category)}
                  </span>
                )}
                {!tx.is_confirmed && (
                  <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                    予定
                  </span>
                )}
              </div>
              <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                {tx.scheduled_date && (
                  <span>{formatDate(tx.scheduled_date)}</span>
                )}
                {tx.memo && (
                  <span className="truncate">{tx.memo}</span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex shrink-0 items-center gap-0.5">
              <PrismButton
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => onEdit(tx)}
              >
                <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
              </PrismButton>
              <PrismButton
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => onDelete(tx.id)}
              >
                <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
              </PrismButton>
            </div>
          </PrismCard>
        );
      })}
    </div>
  );
}
