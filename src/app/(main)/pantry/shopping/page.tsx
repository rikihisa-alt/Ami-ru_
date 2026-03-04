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
import { Check, Plus, Trash2, ShoppingCart } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { cn } from "@/lib/utils";

export default function ShoppingPage() {
  const { data: items } = useShoppingItems();
  const addItem = useAddShoppingItem();
  const toggleItem = useToggleShoppingItem();
  const deleteItem = useDeleteShoppingItem();
  const [newItemName, setNewItemName] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    try {
      await addItem.mutateAsync({ name: newItemName.trim() });
      setNewItemName("");
    } catch {
      // silent in demo mode
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
        <ShoppingCart className="h-5 w-5 text-orange-400" />
        <h1 className="text-xl font-bold text-foreground">買い物リスト</h1>
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
          className=""
          disabled={addItem.isPending}
        >
          <Plus className="h-4 w-4 text-white" />
        </Button>
      </form>

      {!items?.length ? (
        <EmptyState
          icon={ShoppingCart}
          title="買い物リストを共有しよう"
          description="買い忘れ防止に"
        />
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
                      ? "border-emerald-400 bg-emerald-400 text-white"
                      : "border-border hover:border-emerald-400"
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
                  onClick={() => setDeleteTarget(item.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </Card>
            )
          )}
        </div>
      )}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="このアイテムを削除しますか？"
        onConfirm={() => {
          if (deleteTarget) handleDelete(deleteTarget);
          setDeleteTarget(null);
        }}
      />
    </div>
  );
}
