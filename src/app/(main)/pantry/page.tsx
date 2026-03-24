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
  SelectGroup,
  SelectLabel,
} from "@/components/ui/select";
import { PrismButton } from "@/components/ui/prism-button";
import { STOCK_CATEGORIES, STORAGE_LOCATIONS, getCategoryGroups, getStorageEmoji } from "@/lib/utils/categories";
import { ShoppingCart, Package } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";

export default function StockPage() {
  const { data: items } = usePantryItems();
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [locationFilter, setLocationFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("expiry");

  const categoryGroups = getCategoryGroups();

  const filteredItems = items
    ?.filter(
      (item: { category: string | null; storage_location?: string | null }) => {
        const catMatch = categoryFilter === "all" || item.category === categoryFilter;
        const locMatch = locationFilter === "all" || (item.storage_location ?? "fridge") === locationFilter;
        return catMatch && locMatch;
      }
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
          return new Date(a.expiry_date).getTime() - new Date(b.expiry_date).getTime();
        }
        if (sortBy === "name") return a.name.localeCompare(b.name, "ja");
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    );

  // 保管場所ごとのアイテム数をカウント
  const locationCounts: Record<string, number> = {};
  items?.forEach((item: { storage_location?: string | null }) => {
    const loc = item.storage_location ?? "fridge";
    locationCounts[loc] = (locationCounts[loc] ?? 0) + 1;
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between motion-safe:animate-prism-fade-up">
        <div className="flex items-center gap-2.5">
          <Package className="h-5 w-5 text-primary" />
          <h1 className="text-xl font-bold tracking-tight text-foreground">ストック</h1>
        </div>
        <Link href="/pantry/shopping">
          <PrismButton variant="secondary" size="sm">
            <ShoppingCart className="mr-1.5 h-4 w-4" />
            買い物リスト
          </PrismButton>
        </Link>
      </div>

      {/* 保管場所タブ */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 motion-safe:animate-prism-fade-up" style={{ animationDelay: "30ms" }}>
        <button
          onClick={() => setLocationFilter("all")}
          className={`shrink-0 rounded-full px-3 py-1.5 text-[13px] font-medium transition-colors ${
            locationFilter === "all"
              ? "bg-primary text-white"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
        >
          すべて {items?.length ? `(${items.length})` : ""}
        </button>
        {STORAGE_LOCATIONS.map((loc) => {
          const count = locationCounts[loc.value] ?? 0;
          if (count === 0 && locationFilter !== loc.value) return null;
          return (
            <button
              key={loc.value}
              onClick={() => setLocationFilter(loc.value)}
              className={`shrink-0 rounded-full px-3 py-1.5 text-[13px] font-medium transition-colors ${
                locationFilter === loc.value
                  ? "bg-primary text-white"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {loc.emoji} {loc.label} ({count})
            </button>
          );
        })}
      </div>

      {/* フィルタ */}
      <div className="flex gap-2 motion-safe:animate-prism-fade-up" style={{ animationDelay: "50ms" }}>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[140px] rounded-xl">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">すべてのカテゴリ</SelectItem>
            {Object.entries(categoryGroups).map(([group, cats]) => (
              <SelectGroup key={group}>
                <SelectLabel className="text-[11px] text-muted-foreground">{group}</SelectLabel>
                {cats.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            ))}
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[110px] rounded-xl">
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
          icon={Package}
          title="ストックを管理しよう"
          description="食材や日用品のストックをまとめて管理"
          action={{ label: "アイテムを追加", onClick: () => document.querySelector<HTMLButtonElement>(".fab-trigger")?.click() }}
        />
      ) : (
        <div className="space-y-2">
          {filteredItems.map(
            (item: {
              id: string;
              name: string;
              quantity: string | null;
              category: string | null;
              storage_location?: string | null;
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
