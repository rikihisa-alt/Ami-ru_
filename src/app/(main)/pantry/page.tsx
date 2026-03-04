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
import { PrismButton } from "@/components/ui/prism-button";
import { PANTRY_CATEGORIES } from "@/lib/utils/categories";
import { ShoppingCart, Refrigerator } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";

export default function PantryPage() {
  const { data: items } = usePantryItems();
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
    <div className="space-y-5">
      <div className="flex items-center justify-between motion-safe:animate-prism-fade-up">
        <div className="flex items-center gap-2.5">
          <Refrigerator className="h-5 w-5 text-orange-400" />
          <h1 className="text-xl font-bold tracking-tight text-foreground">冷蔵庫</h1>
        </div>
        <Link href="/pantry/shopping">
          <PrismButton variant="secondary" size="sm">
            <ShoppingCart className="mr-1.5 h-4 w-4" />
            買い物リスト
          </PrismButton>
        </Link>
      </div>

      <div className="flex gap-2 motion-safe:animate-prism-fade-up" style={{ animationDelay: "50ms" }}>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[120px] rounded-xl">
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
          <SelectTrigger className="w-[120px] rounded-xl">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="expiry">期限順</SelectItem>
            <SelectItem value="name">名前順</SelectItem>
            <SelectItem value="recent">新しい順</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {!filteredItems?.length ? (
        <EmptyState
          icon={Refrigerator}
          title="冷蔵庫の中身を管理しよう"
          description="食材ロスを減らして節約に"
          action={{ label: "食材を追加", onClick: () => document.querySelector<HTMLButtonElement>(".fab-trigger")?.click() }}
        />
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
