"use client";

import { useMemo } from "react";
import {
  getCalendarGrid,
  getEventsForDay,
  WEEKDAY_LABELS,
  isSameMonth,
  isToday as checkIsToday,
  format,
} from "@/lib/utils/calendar-grid";
import { getEventColor } from "@/lib/utils/event-colors";
import { PrismCard } from "@/components/ui/prism-card";
import { cn } from "@/lib/utils";

interface CalendarGridProps {
  year: number;
  month: number; // 0-indexed
  events: any[];
  selectedDate: string | null; // YYYY-MM-DD or null
  onSelectDate: (date: string) => void;
}

export function CalendarGrid({
  year,
  month,
  events,
  selectedDate,
  onSelectDate,
}: CalendarGridProps) {
  const grid = useMemo(() => getCalendarGrid(year, month), [year, month]);
  const currentMonth = useMemo(() => new Date(year, month), [year, month]);

  return (
    <PrismCard variant="flat" className="p-2 sm:p-3">
      {/* Weekday header */}
      <div className="grid grid-cols-7 text-center text-xs">
        {WEEKDAY_LABELS.map((label, i) => (
          <div
            key={label}
            className={cn(
              "py-1.5 font-medium",
              i === 0 && "text-rose-400",
              i === 6 && "text-sky-400",
              i !== 0 && i !== 6 && "text-muted-foreground"
            )}
          >
            {label}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-px">
        {grid.map((day) => {
          const dateStr = format(day, "yyyy-MM-dd");
          const inMonth = isSameMonth(day, currentMonth);
          const today = checkIsToday(day);
          const selected = dateStr === selectedDate;
          const dayOfWeek = day.getDay();
          const { allDay, timed } = events.length > 0
            ? getEventsForDay(events, day)
            : { allDay: [], timed: [] };

          return (
            <button
              key={dateStr}
              type="button"
              onClick={() => onSelectDate(dateStr)}
              className={cn(
                "relative flex h-14 flex-col items-center gap-0.5 rounded-xl p-1 transition-all duration-150 sm:h-20 sm:p-1.5",
                "hover:bg-secondary/60 active:scale-95",
                selected && "ring-2 ring-primary ring-offset-1 ring-offset-background",
                !inMonth && "opacity-40"
              )}
            >
              {/* Day number */}
              <span
                className={cn(
                  "flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium text-foreground sm:text-sm",
                  today && "bg-primary/15 font-bold text-primary",
                  dayOfWeek === 0 && inMonth && !today && "text-rose-400",
                  dayOfWeek === 6 && inMonth && !today && "text-sky-400"
                )}
              >
                {day.getDate()}
              </span>

              {/* All-day event bands */}
              {allDay.length > 0 && (
                <div className="flex w-full flex-col gap-px">
                  {allDay.slice(0, 2).map((ev: any) => (
                    <div
                      key={ev.id}
                      className={cn(
                        "h-1 w-full rounded-full",
                        getEventColor(ev.color ?? "primary").band
                      )}
                    />
                  ))}
                </div>
              )}

              {/* Timed event dots */}
              {timed.length > 0 && (
                <div className="flex items-center gap-0.5">
                  {timed.slice(0, 3).map((ev: any) => (
                    <div
                      key={ev.id}
                      className={cn(
                        "h-1.5 w-1.5 rounded-full",
                        getEventColor(ev.color ?? "primary").dot
                      )}
                    />
                  ))}
                  {timed.length > 3 && (
                    <span className="text-[9px] leading-none text-muted-foreground">
                      +{timed.length - 3}
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </PrismCard>
  );
}
