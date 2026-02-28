"use client";

import { useState } from "react";
import {
  useShoppingItems,
  useAddShoppingItem,
  useToggleShoppingItem,
  useDeleteShoppingItem,
} from "@/lib/hooks/use-shopping";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Check, Plus, Trash2, ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ShoppingPage() {
  const { data: items, isLoading } = useShoppingItems();
  const addItem = useAddShoppingItem();
  const toggleItem = useToggleShoppingItem();
  const deleteItem = useDeleteShoppingItem();
  const [newItemName, setNewItemName] = useState("");

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    try {
      await addItem.mutateAsync({ name: newItemName.trim() });
      setNewItemName("");
    } catch {
      toast.error("追加に失敗しました");
    }
  };

  const handleToggle = (itemId: string, currentStatus: boolean) => {
    toggleItem.mutate({ itemId, isPurchased: !currentStatus });
  };

  const handleDelete = (itemId: string) => {
    deleteItem.mutate(itemId);
  };

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">買い物リスト</h1>

      <form onSubmit={handleAdd} className="flex gap-2">
        <Input
          value={newItemName}
          onChange={(e) => setNewItemName(e.target.value)}
          placeholder="買うものを追加"
          className="flex-1"
        />
        <Button type="submit" size="icon" disabled={addItem.isPending}>
          <Plus className="h-4 w-4" />
        </Button>
      </form>

      {isLoading ? (
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-12 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      ) : items?.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-12 text-muted-foreground">
          <ShoppingCart className="h-12 w-12" />
          <p>買い物リストは空です</p>
        </div>
      ) : (
        <div className="space-y-2">
          {items?.map(
            (item: {
              id: string;
              name: string;
              is_purchased: boolean;
              quantity: string | null;
            }) => (
              <Card
                key={item.id}
                className="flex items-center gap-3 p-3"
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "h-8 w-8 shrink-0 rounded-full border-2",
                    item.is_purchased
                      ? "border-green-500 bg-green-500 text-white"
                      : "border-muted-foreground/30"
                  )}
                  onClick={() => handleToggle(item.id, item.is_purchased)}
                >
                  {item.is_purchased && <Check className="h-4 w-4" />}
                </Button>
                <span
                  className={cn(
                    "flex-1 text-sm",
                    item.is_purchased && "text-muted-foreground line-through"
                  )}
                >
                  {item.name}
                  {item.quantity && (
                    <span className="ml-1 text-muted-foreground">
                      ({item.quantity})
                    </span>
                  )}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0 text-muted-foreground"
                  onClick={() => handleDelete(item.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </Card>
            )
          )}
        </div>
      )}
    </div>
  );
}
