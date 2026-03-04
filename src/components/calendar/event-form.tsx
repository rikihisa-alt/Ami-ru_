"use client";

import { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { PrismButton } from "@/components/ui/prism-button";
import {
  useAddCalendarEvent,
  useUpdateCalendarEvent,
} from "@/lib/hooks/use-calendar";
import { EVENT_COLORS, getEventColor } from "@/lib/utils/event-colors";
import { format, parseISO } from "@/lib/utils/calendar-grid";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

type AssigneeValue = "shared" | "mine" | "partner";

interface EventFormProps {
  /** When provided, the form operates in edit mode with pre-filled fields */
  editEvent?: any | null;
  /** Controlled open state (used in edit mode) */
  open?: boolean;
  /** Controlled open-change handler (used in edit mode) */
  onOpenChange?: (open: boolean) => void;
  /** Called after successful save / update */
  onSuccess?: () => void;
  /** Current user ID for assignee resolution */
  userId?: string;
  /** Partner user ID for assignee resolution */
  partnerId?: string | null;
  /** Default date when opening the form (YYYY-MM-DD) */
  defaultDate?: string;
}

export function EventForm({
  editEvent,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  onSuccess,
  userId,
  partnerId,
  defaultDate,
}: EventFormProps) {
  const isEditMode = !!editEvent;

  // Internal open state for add mode
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = controlledOnOpenChange ?? setInternalOpen;

  // Form fields
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(
    defaultDate ?? new Date().toISOString().split("T")[0]
  );
  const [time, setTime] = useState("");
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("");
  const [isAllDay, setIsAllDay] = useState(true);
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState("primary");
  const [assignee, setAssignee] = useState<AssigneeValue>("shared");

  const addEvent = useAddCalendarEvent();
  const updateEvent = useUpdateCalendarEvent();

  // Reset form to defaults
  const resetForm = useCallback(() => {
    setTitle("");
    setDate(defaultDate ?? new Date().toISOString().split("T")[0]);
    setTime("");
    setEndDate("");
    setEndTime("");
    setIsAllDay(true);
    setLocation("");
    setDescription("");
    setColor("primary");
    setAssignee("shared");
  }, [defaultDate]);

  // Pre-fill form when editEvent changes
  useEffect(() => {
    if (!editEvent) return;

    setTitle(editEvent.title ?? "");
    setDescription(editEvent.description ?? "");
    setLocation(editEvent.location ?? "");
    setIsAllDay(editEvent.is_all_day ?? true);
    setColor(editEvent.color ?? "primary");

    // Parse start
    if (editEvent.start_at) {
      const start = parseISO(editEvent.start_at);
      setDate(format(start, "yyyy-MM-dd"));
      setTime(editEvent.is_all_day ? "" : format(start, "HH:mm"));
    }

    // Parse end
    if (editEvent.end_at) {
      const end = parseISO(editEvent.end_at);
      setEndDate(format(end, "yyyy-MM-dd"));
      setEndTime(editEvent.is_all_day ? "" : format(end, "HH:mm"));
    } else {
      setEndDate("");
      setEndTime("");
    }

    // Assignee
    if (editEvent.assignee_id === null || editEvent.assignee_id === undefined) {
      setAssignee("shared");
    } else if (editEvent.assignee_id === userId) {
      setAssignee("mine");
    } else {
      setAssignee("partner");
    }
  }, [editEvent, userId]);

  // Update defaultDate when it changes (for add mode)
  useEffect(() => {
    if (!isEditMode && defaultDate) {
      setDate(defaultDate);
    }
  }, [defaultDate, isEditMode]);

  const resolveAssigneeId = (): string | null => {
    if (assignee === "mine") return userId ?? null;
    if (assignee === "partner") return partnerId ?? null;
    return null; // shared
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const startAt = isAllDay
      ? new Date(`${date}T00:00:00`).toISOString()
      : new Date(`${date}T${time || "00:00"}`).toISOString();

    const endAt =
      endDate || endTime
        ? isAllDay
          ? new Date(`${endDate || date}T23:59:59`).toISOString()
          : new Date(
              `${endDate || date}T${endTime || time || "00:00"}`
            ).toISOString()
        : null;

    const payload = {
      title: title.trim(),
      description: description || undefined,
      is_all_day: isAllDay,
      start_at: startAt,
      end_at: endAt ?? undefined,
      location: location || undefined,
      color,
      assignee_id: resolveAssigneeId(),
    };

    try {
      if (isEditMode && editEvent) {
        await updateEvent.mutateAsync({
          eventId: editEvent.id,
          updates: {
            ...payload,
            location: location || null,
            end_at: endAt,
          },
        });
        toast.success("予定を更新しました");
      } else {
        await addEvent.mutateAsync(payload);
        toast.success("予定を追加しました");
      }
      resetForm();
      setOpen(false);
      onSuccess?.();
    } catch {
      toast.error(isEditMode ? "更新に失敗しました" : "追加に失敗しました");
    }
  };

  const isPending = addEvent.isPending || updateEvent.isPending;

  return (
    <Sheet
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v && !isEditMode) resetForm();
      }}
    >
      {/* FAB trigger only in add mode */}
      {!isEditMode && (
        <SheetTrigger asChild>
          <PrismButton
            size="icon"
            className="fixed bottom-20 right-4 z-40 h-14 w-14 rounded-full shadow-lg lg:bottom-8"
          >
            <Plus className="h-6 w-6" />
          </PrismButton>
        </SheetTrigger>
      )}

      <SheetContent side="bottom" className="mx-auto max-w-lg rounded-t-2xl">
        <SheetHeader>
          <SheetTitle>
            {isEditMode ? "予定を編集" : "予定を追加"}
          </SheetTitle>
        </SheetHeader>
        <form
          onSubmit={handleSubmit}
          className="mt-2 max-h-[70vh] space-y-4 overflow-y-auto px-1 pb-4"
        >
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="evt-title">タイトル *</Label>
            <Input
              id="evt-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="例: ディナー"
              autoFocus
              required
              className="rounded-xl"
            />
          </div>

          {/* Color picker */}
          <div className="space-y-2">
            <Label>カラー</Label>
            <div className="flex gap-2.5">
              {EVENT_COLORS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setColor(c.value)}
                  className={cn(
                    "h-7 w-7 rounded-full transition-all",
                    c.dot,
                    color === c.value
                      ? "ring-2 ring-primary ring-offset-2 ring-offset-background"
                      : "opacity-60 hover:opacity-100"
                  )}
                  title={c.label}
                />
              ))}
            </div>
          </div>

          {/* All-day toggle */}
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={isAllDay}
                onChange={(e) => setIsAllDay(e.target.checked)}
                className="rounded border-border text-primary focus:ring-primary/40"
              />
              終日
            </label>
          </div>

          {/* Start date/time */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="evt-date">開始日 *</Label>
              <Input
                id="evt-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="rounded-xl"
              />
            </div>
            {!isAllDay && (
              <div className="space-y-2">
                <Label htmlFor="evt-time">開始時間</Label>
                <Input
                  id="evt-time"
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="rounded-xl"
                />
              </div>
            )}
          </div>

          {/* End date/time */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="evt-end-date">終了日</Label>
              <Input
                id="evt-end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="rounded-xl"
              />
            </div>
            {!isAllDay && (
              <div className="space-y-2">
                <Label htmlFor="evt-end-time">終了時間</Label>
                <Input
                  id="evt-end-time"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="rounded-xl"
                />
              </div>
            )}
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="evt-location">場所</Label>
            <Input
              id="evt-location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="場所を入力"
              className="rounded-xl"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="evt-description">メモ</Label>
            <Input
              id="evt-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="メモを入力"
              className="rounded-xl"
            />
          </div>

          {/* Assignee */}
          <div className="space-y-2">
            <Label>担当</Label>
            <div className="flex gap-2">
              {(
                [
                  { value: "shared", label: "共有" },
                  { value: "mine", label: "自分" },
                  { value: "partner", label: "相手" },
                ] as { value: AssigneeValue; label: string }[]
              ).map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setAssignee(opt.value)}
                  className={cn(
                    "flex-1 rounded-xl px-3 py-2 text-xs font-medium transition-all duration-200",
                    assignee === opt.value
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Submit */}
          <PrismButton
            type="submit"
            className="w-full"
            disabled={isPending}
          >
            {isPending
              ? isEditMode
                ? "更新中..."
                : "追加中..."
              : isEditMode
              ? "更新する"
              : "追加する"}
          </PrismButton>
        </form>
      </SheetContent>
    </Sheet>
  );
}
