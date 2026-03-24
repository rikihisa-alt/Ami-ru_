// ── ストック: 保管場所 ──
export const STORAGE_LOCATIONS = [
  { value: "fridge", label: "冷蔵庫", emoji: "🧊" },
  { value: "freezer", label: "冷凍庫", emoji: "❄️" },
  { value: "shelf_1", label: "棚1", emoji: "🗄️" },
  { value: "shelf_2", label: "棚2", emoji: "🗄️" },
  { value: "pantry", label: "パントリー", emoji: "🏠" },
  { value: "bathroom", label: "洗面所", emoji: "🚿" },
  { value: "closet", label: "収納", emoji: "📦" },
  { value: "other", label: "その他", emoji: "📍" },
] as const;

// ── ストック: カテゴリ ──
export const STOCK_CATEGORIES = [
  // 食品
  { value: "vegetable", label: "野菜", group: "食品", color: "green" },
  { value: "meat", label: "肉", group: "食品", color: "red" },
  { value: "fish", label: "魚", group: "食品", color: "blue" },
  { value: "dairy", label: "乳製品", group: "食品", color: "sky" },
  { value: "egg", label: "卵", group: "食品", color: "yellow" },
  { value: "grain", label: "穀物・麺", group: "食品", color: "amber" },
  { value: "frozen", label: "冷凍食品", group: "食品", color: "indigo" },
  { value: "snack", label: "お菓子", group: "食品", color: "pink" },
  { value: "bread", label: "パン", group: "食品", color: "orange" },
  { value: "prepared", label: "惣菜", group: "食品", color: "rose" },
  // 調味料・飲料
  { value: "seasoning", label: "調味料", group: "調味料・飲料", color: "amber" },
  { value: "beverage", label: "飲料", group: "調味料・飲料", color: "cyan" },
  { value: "alcohol", label: "お酒", group: "調味料・飲料", color: "purple" },
  // 日用品
  { value: "cleaning", label: "洗剤・掃除用品", group: "日用品", color: "teal" },
  { value: "toiletry", label: "トイレ用品", group: "日用品", color: "slate" },
  { value: "bath", label: "バス用品", group: "日用品", color: "sky" },
  { value: "kitchen_supply", label: "キッチン用品", group: "日用品", color: "lime" },
  { value: "tissue", label: "ティッシュ・紙類", group: "日用品", color: "stone" },
  { value: "laundry", label: "洗濯用品", group: "日用品", color: "violet" },
  // その他
  { value: "medicine", label: "薬・サプリ", group: "その他", color: "emerald" },
  { value: "pet", label: "ペット用品", group: "その他", color: "fuchsia" },
  { value: "other", label: "その他", group: "その他", color: "gray" },
] as const;

// 旧互換用エイリアス
export const PANTRY_CATEGORIES = STOCK_CATEGORIES;

export const EXPENSE_CATEGORIES = [
  { value: "food", label: "食費", color: "orange" },
  { value: "daily", label: "日用品", color: "blue" },
  { value: "transport", label: "交通費", color: "green" },
  { value: "entertainment", label: "娯楽", color: "purple" },
  { value: "rent", label: "家賃", color: "slate" },
  { value: "utilities", label: "光熱費", color: "yellow" },
  { value: "communication", label: "通信費", color: "teal" },
  { value: "other", label: "その他", color: "gray" },
] as const;

export const PLACE_TAGS = [
  { value: "date", label: "デート", color: "pink" },
  { value: "travel", label: "旅行", color: "blue" },
  { value: "dining", label: "外食", color: "orange" },
  { value: "shopping", label: "買い物", color: "green" },
] as const;

export function getCategoryLabel(
  categories: readonly { value: string; label: string }[],
  value: string | null | undefined
): string {
  return categories.find((c) => c.value === value)?.label ?? value ?? "";
}

export function getStorageLabel(value: string | null | undefined): string {
  return STORAGE_LOCATIONS.find((s) => s.value === value)?.label ?? value ?? "";
}

export function getStorageEmoji(value: string | null | undefined): string {
  return STORAGE_LOCATIONS.find((s) => s.value === value)?.emoji ?? "📍";
}

export function getCategoryGroups() {
  const groups: Record<string, typeof STOCK_CATEGORIES[number][]> = {};
  for (const cat of STOCK_CATEGORIES) {
    if (!groups[cat.group]) groups[cat.group] = [];
    groups[cat.group].push(cat);
  }
  return groups;
}
