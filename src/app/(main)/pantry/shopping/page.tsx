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
      <div className="flex items-center gap-2">
        <ShoppingCart className="h-5 w-5 text-pink-400" />
        <h1 className="text-xl font-bold bg-gradient-to-r from-pink-500 to-purple-400 bg-clip-text text-transparent">買い物リスト</h1>
      </div>

      <form onSubmit={handleAdd} className="flex gap-2">
        <Input
          value={newItemName}
          onChange={(e) => setNewItemName(e.target.value)}
          placeholder="買うものを追加"
          className="flex-1"
        />
        <Button
          type="submit"
          size="icon"
          className="bg-gradient-to-br from-pink-400 to-purple-400 hover:from-pink-500 hover:to-purple-500"
          disabled={addItem.isPending}
        >
          <Plus className="h-4 w-4 text-white" />
        </Button>
      </form>

      {isLoading ? (
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-12 animate-pulse rounded-2xl bg-pink-50 dark:bg-pink-950/30" />
          ))}
        </div>
      ) : items?.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-muted-foreground">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-pink-50 dark:bg-pink-950/30">
            <ShoppingCart className="h-8 w-8 text-pink-300" />
          </div>
          <p className="font-medium">買い物リストは空です</p>
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
                className="flex items-center gap-3 border-pink-100/60 p-3 dark:border-pink-900/20"
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "h-8 w-8 shrink-0 rounded-full border-2",
                    item.is_purchased
                      ? "border-emerald-400 bg-emerald-400 text-white"
                      : "border-pink-300/50 hover:border-pink-400"
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
                  className="h-8 w-8 shrink-0 text-muted-foreground hover:text-red-400"
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
