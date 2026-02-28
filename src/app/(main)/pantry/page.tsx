"use client";

import { useState } from "react";
import Link from "next/link";
import { usePantryItems } from "@/lib/hooks/use-pantry";
import { PantryItemCard } from "@/components/pantry/pantry-item-card";
import { PantryAddForm } from "@/components/pantry/pantry-add-form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { PANTRY_CATEGORIES } from "@/lib/utils/categories";
import { ShoppingCart, Package } from "lucide-react";

export default function PantryPage() {
  const { data: items, isLoading } = usePantryItems();
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("expiry");

  const filteredItems = items
    ?.filter(
      (item: { category: string | null }) =>
        categoryFilter === "all" || item.category === categoryFilter
    )
    ?.sort(
      (
        a: { expiry_date: string | null; name: string; created_at: string },
        b: { expiry_date: string | null; name: string; created_at: string }
      ) => {
        if (sortBy === "expiry") {
          if (!a.expiry_date && !b.expiry_date) return 0;
          if (!a.expiry_date) return 1;
          if (!b.expiry_date) return -1;
          return (
            new Date(a.expiry_date).getTime() -
            new Date(b.expiry_date).getTime()
          );
        }
        if (sortBy === "name") return a.name.localeCompare(b.name, "ja");
        return (
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      }
    );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">冷蔵庫</h1>
        <Button variant="outline" size="sm" asChild>
          <Link href="/pantry/shopping">
            <ShoppingCart className="mr-1 h-4 w-4" />
            買い物リスト
          </Link>
        </Button>
      </div>

      <div className="flex gap-2">
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[120px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">すべて</SelectItem>
            {PANTRY_CATEGORIES.map((cat) => (
              <SelectItem key={cat.value} value={cat.value}>
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[120px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="expiry">期限順</SelectItem>
            <SelectItem value="name">名前順</SelectItem>
            <SelectItem value="recent">新しい順</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-16 animate-pulse rounded-lg bg-muted"
            />
          ))}
        </div>
      ) : filteredItems?.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-12 text-muted-foreground">
          <Package className="h-12 w-12" />
          <p>食材がありません</p>
          <p className="text-sm">右下の＋ボタンから追加しましょう</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredItems?.map(
            (item: {
              id: string;
              name: string;
              quantity: string | null;
              category: string | null;
              expiry_date: string | null;
              memo: string | null;
            }) => (
              <PantryItemCard key={item.id} item={item} />
            )
          )}
        </div>
      )}

      <PantryAddForm />
    </div>
  );
}
