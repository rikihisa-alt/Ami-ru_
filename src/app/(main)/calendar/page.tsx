"use client";

export const dynamic = "force-dynamic";

import { useState, useMemo, useEffect, useCallback } from "react";
import {
  useMonthEvents,
  useDeleteCalendarEvent,
} from "@/lib/hooks/use-calendar";
import { useSupabase, useUser } from "@/providers/supabase-provider";
import { CalendarGrid } from "@/components/calendar/calendar-grid";
import { PersonFilter } from "@/components/calendar/person-filter";
import { EventDetailModal } from "@/components/calendar/event-detail-modal";
import { EventForm } from "@/components/calendar/event-form";
import { EmptyState } from "@/components/shared/empty-state";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { PrismButton } from "@/components/ui/prism-button";
import { PrismCard } from "@/components/ui/prism-card";
import { getEventColor } from "@/lib/utils/event-colors";
import { getEventsForDay, format, parseISO } from "@/lib/utils/calendar-grid";
import { ja } from "date-fns/locale";
import { formatMonthYear } from "@/lib/utils/date";
import { cn } from "@/lib/utils";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  MapPin,
} from "lucide-react";
import { toast } from "sonner";

type PersonFilterValue = "all" | "mine" | "partner";

export default function CalendarPage() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);
  const [editEvent, setEditEvent] = useState<any | null>(null);
  const [editFormOpen, setEditFormOpen] = useState(false);
  const [personFilter, setPersonFilter] = useState<PersonFilterValue>("all");
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const { data: events } = useMonthEvents(year, month);
  const deleteEvent = useDeleteCalendarEvent();
  const supabase = useSupabase();
  const { user, profile } = useUser();

  // Fetch partner profile
  const [partner, setPartner] = useState<{
    id: string;
    display_name: string;
  } | null>(null);

  useEffect(() => {
    if (!profile?.pair_id || !user) return;
    supabase
      .from("profiles")
      .select("id, display_name")
      .eq("pair_id", profile.pair_id)
      .neq("id", user.id)
      .single()
      .then(({ data }) => setPartner(data));
  }, [profile?.pair_id, user, supabase]);

  // Month navigation
  const prevMonth = () => {
    if (month === 0) {
      setYear(year - 1);
      setMonth(11);
    } else {
      setMonth(month - 1);
    }
    setSelectedDate(null);
  };

  const nextMonth = () => {
    if (month === 11) {
      setYear(year + 1);
      setMonth(0);
    } else {
      setMonth(month + 1);
    }
    setSelectedDate(null);
  };

  // Filter events by person
  const filteredEvents = useMemo(() => {
    if (!events) return [];
    if (personFilter === "all") return events;

    return events.filter((ev: any) => {
      if (personFilter === "mine") {
        // Events I created or assigned to me, or shared (no assignee)
        return (
          ev.assignee_id === user?.id ||
          (!ev.assignee_id && ev.created_by === user?.id) ||
          ev.created_by === user?.id
        );
      }
      // partner
      return (
        ev.assignee_id === partner?.id ||
        (!ev.assignee_id && ev.created_by === partner?.id) ||
        ev.created_by === partner?.id
      );
    });
  }, [events, personFilter, user?.id, partner?.id]);

  // Events for selected day
  const selectedDayEvents = useMemo(() => {
    if (!selectedDate || !filteredEvents.length) return { allDay: [], timed: [] };
    const day = new Date(selectedDate + "T00:00:00");
    return getEventsForDay(filteredEvents, day);
  }, [selectedDate, filteredEvents]);

  const hasSelectedDayEvents =
    selectedDayEvents.allDay.length > 0 || selectedDayEvents.timed.length > 0;

  // Resolve assignee display name
  const resolveAssignee = useCallback(
    (assigneeId: string | null, createdBy: string): string => {
      if (!assigneeId) return "共有";
      if (assigneeId === user?.id) return profile?.display_name ?? "自分";
      if (assigneeId === partner?.id) return partner?.display_name ?? "相手";
      // Fallback: check created_by
      if (createdBy === user?.id) return profile?.display_name ?? "自分";
      return partner?.display_name ?? "相手";
    },
    [user?.id, partner?.id, profile?.display_name, partner?.display_name]
  );

  // Handle delete
  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    deleteEvent.mutate(deleteTarget, {
      onSuccess: () => {
        toast.success("予定を削除しました");
        setDeleteTarget(null);
        setSelectedEvent(null);
      },
      onError: () => {
        // silent in demo mode
      },
    });
  };

  // Handle edit from detail modal
  const handleEdit = (ev: any) => {
    setEditEvent(ev);
    setEditFormOpen(true);
  };

  // Handle delete from detail modal (open confirm dialog)
  const handleDeleteRequest = (eventId: string) => {
    setSelectedEvent(null);
    setDeleteTarget(eventId);
  };

  // Format time for event card display
  const formatEventTime = (ev: any): string => {
    if (ev.is_all_day) return "終日";
    const start = parseISO(ev.start_at);
    const startTime = format(start, "HH:mm");
    if (ev.end_at) {
      const end = parseISO(ev.end_at);
      const endTime = format(end, "HH:mm");
      return `${startTime} ~ ${endTime}`;
    }
    return startTime;
  };

  // Selected date display
  const selectedDateLabel = useMemo(() => {
    if (!selectedDate) return "";
    const d = new Date(selectedDate + "T00:00:00");
    return format(d, "M月d日(E)", { locale: ja });
  }, [selectedDate]);

  return (
    <div className="space-y-5">
      {/* Header with month navigation */}
      <div className="flex items-center justify-between motion-safe:animate-prism-fade-up">
        <div className="flex items-center gap-2.5">
          <CalendarIcon className="h-5 w-5 text-violet-400" />
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            予定
          </h1>
        </div>
        <div className="flex items-center gap-1">
          <PrismButton variant="ghost" size="icon" onClick={prevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </PrismButton>
          <span className="min-w-[100px] text-center text-sm font-medium">
            {formatMonthYear(new Date(year, month))}
          </span>
          <PrismButton variant="ghost" size="icon" onClick={nextMonth}>
            <ChevronRight className="h-4 w-4" />
          </PrismButton>
        </div>
      </div>

      {/* Person filter */}
      <div className="motion-safe:animate-prism-fade-up">
        <PersonFilter value={personFilter} onChange={setPersonFilter} />
      </div>

      {/* Calendar grid */}
      <div className="motion-safe:animate-prism-fade-up">
        <CalendarGrid
          year={year}
          month={month}
          events={filteredEvents}
          selectedDate={selectedDate}
          onSelectDate={(d) =>
            setSelectedDate(d === selectedDate ? null : d)
          }
        />
      </div>

      {/* Selected day event list */}
      {selectedDate && (
        <div className="space-y-2 motion-safe:animate-prism-fade-up">
          <h3 className="text-sm font-semibold text-foreground">
            {selectedDateLabel}
          </h3>

          {!hasSelectedDayEvents ? (
            <EmptyState
              icon={CalendarIcon}
              title="予定はありません"
              iconColor="text-muted-foreground/50"
              className="py-10"
            />
          ) : (
            <div className="space-y-2">
              {/* All-day events first */}
              {selectedDayEvents.allDay.map((ev: any) => (
                <button
                  key={ev.id}
                  type="button"
                  onClick={() => setSelectedEvent(ev)}
                  className="w-full text-left"
                >
                  <PrismCard
                    variant="flat"
                    hoverable
                    className="flex items-center gap-3 p-3"
                  >
                    <div
                      className={cn(
                        "h-8 w-1 shrink-0 rounded-full",
                        getEventColor(ev.color ?? "primary").dot
                      )}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {ev.title}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span
                          className={cn(
                            "rounded-full px-1.5 py-0.5 text-[10px] font-medium",
                            getEventColor(ev.color ?? "primary").chip
                          )}
                        >
                          終日
                        </span>
                        <span>
                          {resolveAssignee(
                            ev.assignee_id ?? null,
                            ev.created_by
                          )}
                        </span>
                      </div>
                    </div>
                  </PrismCard>
                </button>
              ))}

              {/* Timed events */}
              {selectedDayEvents.timed.map((ev: any) => (
                <button
                  key={ev.id}
                  type="button"
                  onClick={() => setSelectedEvent(ev)}
                  className="w-full text-left"
                >
                  <PrismCard
                    variant="flat"
                    hoverable
                    className="flex items-center gap-3 p-3"
                  >
                    <div
                      className={cn(
                        "h-8 w-1 shrink-0 rounded-full",
                        getEventColor(ev.color ?? "primary").dot
                      )}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {ev.title}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{formatEventTime(ev)}</span>
                        {ev.location && (
                          <span className="flex items-center gap-0.5">
                            <MapPin className="h-3 w-3" />
                            <span className="max-w-[120px] truncate">
                              {ev.location}
                            </span>
                          </span>
                        )}
                        <span>
                          {resolveAssignee(
                            ev.assignee_id ?? null,
                            ev.created_by
                          )}
                        </span>
                      </div>
                    </div>
                  </PrismCard>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Event detail modal */}
      <EventDetailModal
        event={selectedEvent}
        open={!!selectedEvent}
        onOpenChange={(v) => {
          if (!v) setSelectedEvent(null);
        }}
        onEdit={handleEdit}
        onDelete={handleDeleteRequest}
        resolveAssignee={resolveAssignee}
      />

      {/* Delete confirmation dialog */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(v) => {
          if (!v) setDeleteTarget(null);
        }}
        title="予定を削除"
        description="この予定を削除しますか？この操作は取り消せません。"
        confirmLabel="削除する"
        variant="danger"
        onConfirm={handleDeleteConfirm}
        isPending={deleteEvent.isPending}
      />

      {/* Event form (add mode - FAB) */}
      <EventForm
        userId={user?.id}
        partnerId={partner?.id}
        defaultDate={selectedDate ?? undefined}
      />

      {/* Event form (edit mode - controlled) */}
      {editEvent && (
        <EventForm
          editEvent={editEvent}
          open={editFormOpen}
          onOpenChange={(v) => {
            setEditFormOpen(v);
            if (!v) setEditEvent(null);
          }}
          onSuccess={() => {
            setEditEvent(null);
            setEditFormOpen(false);
          }}
          userId={user?.id}
          partnerId={partner?.id}
        />
      )}
    </div>
  );
}
