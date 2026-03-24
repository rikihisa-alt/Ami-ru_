"use client";

import { useState } from "react";
import {
  useShoppingItems,
  useAddShoppingItem,
  useToggleShoppingItem,
  useDeleteShoppingItem,
} from "@/lib/hooks/use-shopping";
import { useAddPantryItem } from "@/lib/hooks/use-pantry";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Check, Plus, Trash2, ShoppingCart, Package } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function ShoppingPage() {
  const { data: items } = useShoppingItems();
  const addItem = useAddShoppingItem();
  const toggleItem = useToggleShoppingItem();
  const deleteItem = useDeleteShoppingItem();
  const addToStock = useAddPantryItem();
  const [newItemName, setNewItemName] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    try {
      await addItem.mutateAsync({ name: newItemName.trim() });
      setNewItemName("");
    } catch {
      // silent
    }
  };

  const handleToggle = (itemId: string, currentStatus: boolean) => {
    toggleItem.mutate({ itemId, isPurchased: !currentStatus });
  };

  const handleDelete = (itemId: string) => {
    deleteItem.mutate(itemId);
  };

  const handleMoveToStock = async (item: { id: string; name: string; category?: string | null }) => {
    try {
      await addToStock.mutateAsync({
        name: item.name,
        category: item.category ?? undefined,
        storage_location: "fridge",
      });
      deleteItem.mutate(item.id);
      toast.success(`${item.name}をストックに追加しました`);
    } catch {
      toast.error("追加に失敗しました");
    }
  };

  const purchasedItems = items?.filter((i: { is_purchased: boolean }) => i.is_purchased) ?? [];
  const unpurchasedItems = items?.filter((i: { is_purchased: boolean }) => !i.is_purchased) ?? [];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <ShoppingCart className="h-5 w-5 text-primary" />
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
        <div className="space-y-4">
          {/* 未購入 */}
          {unpurchasedItems.length > 0 && (
            <div className="space-y-2">
              {unpurchasedItems.map(
                (item: { id: string; name: string; is_purchased: boolean; quantity: string | null; category?: string | null }) => (
                  <Card key={item.id} className="flex items-center gap-3 p-3">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0 rounded-full border-2 border-border hover:border-emerald-400"
                      onClick={() => handleToggle(item.id, item.is_purchased)}
                    >
                      {null}
                    </Button>
                    <span className="flex-1 text-sm">
                      {item.name}
                      {item.quantity && (
                        <span className="ml-1 text-muted-foreground">({item.quantity})</span>
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

          {/* 購入済み → ストックに追加ボタン付き */}
          {purchasedItems.length > 0 && (
            <div className="space-y-2">
              <h2 className="text-[13px] font-medium text-muted-foreground px-1">
                購入済み ({purchasedItems.length})
              </h2>
              {purchasedItems.map(
                (item: { id: string; name: string; is_purchased: boolean; quantity: string | null; category?: string | null }) => (
                  <Card key={item.id} className="flex items-center gap-3 p-3 opacity-60">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0 rounded-full border-2 border-emerald-400 bg-emerald-400 text-white"
                      onClick={() => handleToggle(item.id, item.is_purchased)}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <span className="flex-1 text-sm text-muted-foreground line-through">
                      {item.name}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 shrink-0 text-xs text-primary hover:text-primary/80"
                      onClick={() => handleMoveToStock(item)}
                    >
                      <Package className="mr-1 h-3 w-3" />
                      ストックへ
                    </Button>
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
