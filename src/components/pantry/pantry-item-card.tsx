"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useConsumePantryItem, useMoveToShoppingList } from "@/lib/hooks/use-pantry";
import { getCategoryLabel, PANTRY_CATEGORIES } from "@/lib/utils/categories";
import { getExpiryStatus, getExpiryLabel } from "@/lib/utils/date";
import { toast } from "sonner";
import { Check, ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";

type PantryItemCardProps = {
  item: {
    id: string;
    name: string;
    quantity: string | null;
    category: string | null;
    expiry_date: string | null;
    memo: string | null;
  };
};

const expiryColors = {
  expired: "bg-red-50 text-red-500 border-red-200 dark:bg-red-950/40 dark:text-red-300",
  today: "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300",
  soon: "bg-orange-50 text-orange-500 border-orange-200 dark:bg-orange-950/40 dark:text-orange-300",
  ok: "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300",
  none: "",
};

export function PantryItemCard({ item }: PantryItemCardProps) {
  const consumeItem = useConsumePantryItem();
  const moveToShopping = useMoveToShoppingList();

  const expiryStatus = getExpiryStatus(item.expiry_date);
  const expiryLabel = getExpiryLabel(item.expiry_date);

  const handleConsume = () => {
    consumeItem.mutate(item.id);
    toast.success(`${item.name}を使い切りました`);
  };

  const handleMoveToShopping = () => {
    moveToShopping.mutate({
      name: item.name,
      category: item.category ?? undefined,
      source_pantry_id: item.id,
    });
    toast.success(`${item.name}を買い物リストに追加しました`);
  };

  return (
    <Card className="flex items-center gap-3 p-3">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate font-medium">{item.name}</span>
          {item.quantity && (
            <span className="shrink-0 text-xs text-muted-foreground">
              {item.quantity}
            </span>
          )}
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-1.5">
          {item.category && (
            <Badge variant="secondary" className="text-xs">
              {getCategoryLabel(PANTRY_CATEGORIES, item.category)}
            </Badge>
          )}
          {expiryStatus !== "none" && (
            <Badge
              variant="outline"
              className={cn("text-xs", expiryColors[expiryStatus])}
            >
              {expiryLabel}
            </Badge>
          )}
        </div>
      </div>
      <div className="flex shrink-0 gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-orange-500"
          onClick={handleMoveToShopping}
          title="買い物リストへ"
        >
          <ShoppingCart className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-emerald-500"
          onClick={handleConsume}
          title="使い切り"
        >
          <Check className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
}
