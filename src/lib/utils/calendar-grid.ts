import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  format,
  parseISO,
} from "date-fns";

/**
 * 7×N のカレンダーグリッドを生成（日曜始まり）
 * 前月/次月の日も含む完全グリッド
 */
export function getCalendarGrid(year: number, month: number): Date[] {
  const monthStart = startOfMonth(new Date(year, month));
  const monthEnd = endOfMonth(monthStart);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  return eachDayOfInterval({ start: gridStart, end: gridEnd });
}

/**
 * 日付文字列 (ISO or YYYY-MM-DD) からその日に属するイベントを抽出
 */
export function getEventsForDay<T extends { start_at: string; is_all_day: boolean }>(
  events: T[],
  day: Date
): { allDay: T[]; timed: T[] } {
  const allDay: T[] = [];
  const timed: T[] = [];

  for (const ev of events) {
    const evDate = parseISO(ev.start_at);
    if (isSameDay(evDate, day)) {
      if (ev.is_all_day) {
        allDay.push(ev);
      } else {
        timed.push(ev);
      }
    }
  }

  return { allDay, timed };
}

export const WEEKDAY_LABELS = ["日", "月", "火", "水", "木", "金", "土"] as const;

export { isSameMonth, isSameDay, isToday, format, parseISO };
