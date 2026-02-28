import { format, formatDistanceToNow, isToday, isTomorrow, isPast, differenceInDays } from "date-fns";
import { ja } from "date-fns/locale";

export function formatDate(date: string | Date): string {
  return format(new Date(date), "M月d日(E)", { locale: ja });
}

export function formatDateTime(date: string | Date): string {
  return format(new Date(date), "M月d日(E) HH:mm", { locale: ja });
}

export function formatMonthYear(date: Date): string {
  return format(date, "yyyy年M月", { locale: ja });
}

export function formatRelative(date: string | Date): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true, locale: ja });
}

export function getExpiryStatus(expiryDate: string | null | undefined): "expired" | "today" | "soon" | "ok" | "none" {
  if (!expiryDate) return "none";
  const date = new Date(expiryDate);
  if (isPast(date) && !isToday(date)) return "expired";
  if (isToday(date)) return "today";
  if (differenceInDays(date, new Date()) <= 3) return "soon";
  return "ok";
}

export function getExpiryLabel(expiryDate: string | null | undefined): string {
  if (!expiryDate) return "";
  const date = new Date(expiryDate);
  if (isPast(date) && !isToday(date)) return "期限切れ";
  if (isToday(date)) return "今日まで";
  if (isTomorrow(date)) return "明日まで";
  const days = differenceInDays(date, new Date());
  if (days <= 7) return `あと${days}日`;
  return formatDate(expiryDate);
}
