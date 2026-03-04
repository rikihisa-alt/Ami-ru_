"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { PrismButton } from "@/components/ui/prism-button";
import { getEventColor } from "@/lib/utils/event-colors";
import { format, parseISO } from "@/lib/utils/calendar-grid";
import { ja } from "date-fns/locale";
import { MapPin, Clock, FileText, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface EventDetailModalProps {
  event: any | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (event: any) => void;
  onDelete: (eventId: string) => void;
  /** Display name for assignee resolution */
  resolveAssignee?: (assigneeId: string | null, createdBy: string) => string;
}

export function EventDetailModal({
  event,
  open,
  onOpenChange,
  onEdit,
  onDelete,
  resolveAssignee,
}: EventDetailModalProps) {
  if (!event) return null;

  const color = getEventColor(event.color ?? "primary");
  const startDate = parseISO(event.start_at);
  const endDate = event.end_at ? parseISO(event.end_at) : null;

  const formattedDate = format(startDate, "M月d日(E)", { locale: ja });

  let timeDisplay: string;
  if (event.is_all_day) {
    timeDisplay = "終日";
  } else {
    const startTime = format(startDate, "HH:mm");
    const endTime = endDate ? format(endDate, "HH:mm") : null;
    timeDisplay = endTime ? `${startTime} ~ ${endTime}` : startTime;
  }

  const assigneeLabel = resolveAssignee
    ? resolveAssignee(event.assignee_id ?? null, event.created_by)
    : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[380px] rounded-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <div className={cn("h-3 w-3 shrink-0 rounded-full", color.dot)} />
            <DialogTitle className="text-left text-base leading-snug">
              {event.title}
            </DialogTitle>
          </div>
          <DialogDescription className="sr-only">
            予定の詳細
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 text-sm">
          {/* Date / Time */}
          <div className="flex items-start gap-2.5 text-muted-foreground">
            <Clock className="mt-0.5 h-4 w-4 shrink-0" />
            <div>
              <p className="font-medium text-foreground">{formattedDate}</p>
              <p>{timeDisplay}</p>
            </div>
          </div>

          {/* Location */}
          {event.location && (
            <div className="flex items-start gap-2.5 text-muted-foreground">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
              <p>{event.location}</p>
            </div>
          )}

          {/* Description */}
          {event.description && (
            <div className="flex items-start gap-2.5 text-muted-foreground">
              <FileText className="mt-0.5 h-4 w-4 shrink-0" />
              <p className="whitespace-pre-wrap">{event.description}</p>
            </div>
          )}

          {/* Assignee */}
          {assigneeLabel && (
            <div className="flex items-start gap-2.5 text-muted-foreground">
              <User className="mt-0.5 h-4 w-4 shrink-0" />
              <p>{assigneeLabel}</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="mt-2 flex gap-2">
          <PrismButton
            variant="secondary"
            size="sm"
            className="flex-1"
            onClick={() => {
              onEdit(event);
              onOpenChange(false);
            }}
          >
            編集
          </PrismButton>
          <PrismButton
            variant="danger"
            size="sm"
            className="flex-1"
            onClick={() => {
              onDelete(event.id);
            }}
          >
            削除
          </PrismButton>
        </div>
      </DialogContent>
    </Dialog>
  );
}
