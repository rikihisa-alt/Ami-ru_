export const PANTRY_CATEGORIES = [
  { value: "vegetable", label: "野菜", color: "green" },
  { value: "meat", label: "肉", color: "red" },
  { value: "fish", label: "魚", color: "blue" },
  { value: "dairy", label: "乳製品", color: "sky" },
  { value: "seasoning", label: "調味料", color: "amber" },
  { value: "beverage", label: "飲料", color: "cyan" },
  { value: "frozen", label: "冷凍食品", color: "indigo" },
  { value: "snack", label: "お菓子", color: "pink" },
  { value: "other", label: "その他", color: "gray" },
] as const;

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
