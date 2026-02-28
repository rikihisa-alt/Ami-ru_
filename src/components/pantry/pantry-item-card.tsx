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
  expired: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  today: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  soon: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  ok: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
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
              variant="secondary"
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
          className="h-8 w-8"
          onClick={handleMoveToShopping}
          title="買い物リストへ"
        >
          <ShoppingCart className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-green-600 hover:bg-green-50 hover:text-green-700"
          onClick={handleConsume}
          title="使い切り"
        >
          <Check className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
}
