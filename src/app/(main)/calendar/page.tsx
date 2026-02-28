"use client";

import { useState, useMemo } from "react";
import { useMonthEvents, useDeleteCalendarEvent } from "@/lib/hooks/use-calendar";
import { EventForm } from "@/components/calendar/event-form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDate, formatDateTime, formatMonthYear } from "@/lib/utils/date";
import { cn } from "@/lib/utils";
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  Trash2,
  Calendar as CalendarIcon,
} from "lucide-react";
import { toast } from "sonner";

export default function CalendarPage() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const { data: events, isLoading } = useMonthEvents(year, month);
  const deleteEvent = useDeleteCalendarEvent();

  const prevMonth = () => {
    if (month === 0) {
      setYear(year - 1);
      setMonth(11);
    } else {
      setMonth(month - 1);
    }
  };

  const nextMonth = () => {
    if (month === 11) {
      setYear(year + 1);
      setMonth(0);
    } else {
      setMonth(month + 1);
    }
  };

  const eventsByDate = useMemo(() => {
    if (!events) return {};
    return events.reduce(
      (
        acc: Record<string, typeof events>,
        event: { start_at: string }
      ) => {
        const date = new Date(event.start_at).toISOString().split("T")[0];
        if (!acc[date]) acc[date] = [];
        acc[date].push(event);
        return acc;
      },
      {} as Record<string, typeof events>
    );
  }, [events]);

  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days: (number | null)[] = [];

    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);

    return days;
  }, [year, month]);

  const getEventsForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return eventsByDate[dateStr] ?? [];
  };

  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

  const handleDelete = (eventId: string) => {
    deleteEvent.mutate(eventId);
    toast.success("予定を削除しました");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5 text-pink-400" />
          <h1 className="text-xl font-bold bg-gradient-to-r from-pink-500 to-purple-400 bg-clip-text text-transparent">予定</h1>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-pink-50 dark:hover:bg-pink-950" onClick={prevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="min-w-[100px] text-center text-sm font-medium">
            {formatMonthYear(new Date(year, month))}
          </span>
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-pink-50 dark:hover:bg-pink-950" onClick={nextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Tabs defaultValue="month">
        <TabsList className="w-full bg-pink-50/50 dark:bg-pink-950/20">
          <TabsTrigger value="month" className="flex-1 data-[state=active]:bg-white data-[state=active]:text-pink-500 dark:data-[state=active]:bg-background">
            月
          </TabsTrigger>
          <TabsTrigger value="list" className="flex-1 data-[state=active]:bg-white data-[state=active]:text-pink-500 dark:data-[state=active]:bg-background">
            リスト
          </TabsTrigger>
        </TabsList>

        <TabsContent value="month" className="mt-4">
          <div className="grid grid-cols-7 gap-px text-center text-xs">
            {["日", "月", "火", "水", "木", "金", "土"].map((d) => (
              <div key={d} className="py-1 font-medium text-muted-foreground">
                {d}
              </div>
            ))}
            {calendarDays.map((day, i) => {
              if (day === null) return <div key={`empty-${i}`} />;
              const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
              const dayEvents = getEventsForDay(day);
              const isToday = dateStr === todayStr;
              const isSelected = dateStr === selectedDate;

              return (
                <button
                  key={day}
                  onClick={() => setSelectedDate(dateStr === selectedDate ? null : dateStr)}
                  className={cn(
                    "flex flex-col items-center gap-0.5 rounded-xl p-1 transition-all",
                    isToday && "bg-pink-50 font-bold dark:bg-pink-950/40",
                    isSelected && "ring-2 ring-pink-400"
                  )}
                >
                  <span className={cn("text-sm", isToday && "text-pink-500")}>
                    {day}
                  </span>
                  {dayEvents.length > 0 && (
                    <div className="flex gap-0.5">
                      {dayEvents.slice(0, 3).map((_: unknown, idx: number) => (
                        <div
                          key={idx}
                          className="h-1 w-1 rounded-full bg-pink-400"
                        />
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {selectedDate && (
            <div className="mt-4 space-y-2">
              <h3 className="text-sm font-medium text-pink-500">
                {formatDate(selectedDate)}
              </h3>
              {(eventsByDate[selectedDate] ?? []).length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  予定はありません
                </p>
              ) : (
                eventsByDate[selectedDate]?.map(
                  (event: {
                    id: string;
                    title: string;
                    start_at: string;
                    is_all_day: boolean;
                    location: string | null;
                  }) => (
                    <Card key={event.id} className="flex items-center gap-3 border-pink-100/60 p-3 dark:border-pink-900/20">
                      <div className="flex-1">
                        <p className="text-sm font-medium">{event.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {event.is_all_day
                            ? "終日"
                            : formatDateTime(event.start_at).split(" ")[1]}
                        </p>
                        {event.location && (
                          <p className="flex items-center gap-1 text-xs text-muted-foreground">
                            <MapPin className="h-3 w-3 text-pink-400" />
                            {event.location}
                          </p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-red-400"
                        onClick={() => handleDelete(event.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </Card>
                  )
                )
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="list" className="mt-4">
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="h-16 animate-pulse rounded-2xl bg-pink-50 dark:bg-pink-950/30"
                />
              ))}
            </div>
          ) : events?.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-16 text-muted-foreground">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-pink-50 dark:bg-pink-950/30">
                <CalendarIcon className="h-8 w-8 text-pink-300" />
              </div>
              <p className="font-medium">今月の予定はありません</p>
            </div>
          ) : (
            <div className="space-y-2">
              {Object.entries(eventsByDate)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([date, dayEvents]) => (
                  <div key={date}>
                    <h3 className="mb-1 text-xs font-medium text-pink-400">
                      {formatDate(date)}
                    </h3>
                    {(dayEvents as { id: string; title: string; start_at: string; is_all_day: boolean; location: string | null }[]).map((event) => (
                      <Card
                        key={event.id}
                        className="mb-2 flex items-center gap-3 border-pink-100/60 p-3 dark:border-pink-900/20"
                      >
                        <div className="flex-1">
                          <p className="text-sm font-medium">{event.title}</p>
                          <div className="flex gap-2">
                            {event.is_all_day ? (
                              <Badge variant="secondary" className="bg-violet-50 text-violet-500 text-xs dark:bg-violet-900/30 dark:text-violet-300">
                                終日
                              </Badge>
                            ) : (
                              <span className="text-xs text-muted-foreground">
                                {formatDateTime(event.start_at).split(" ")[1]}
                              </span>
                            )}
                            {event.location && (
                              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                <MapPin className="h-3 w-3 text-pink-400" />
                                {event.location}
                              </span>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-red-400"
                          onClick={() => handleDelete(event.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </Card>
                    ))}
                  </div>
                ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <EventForm />
    </div>
  );
}
