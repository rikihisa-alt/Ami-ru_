"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useAddCalendarEvent } from "@/lib/hooks/use-calendar";
import { toast } from "sonner";
import { Plus } from "lucide-react";

export function EventForm() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [time, setTime] = useState("");
  const [isAllDay, setIsAllDay] = useState(true);
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");

  const addEvent = useAddCalendarEvent();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const startAt = isAllDay
      ? new Date(`${date}T00:00:00`).toISOString()
      : new Date(`${date}T${time}`).toISOString();

    try {
      await addEvent.mutateAsync({
        title: title.trim(),
        description: description || undefined,
        is_all_day: isAllDay,
        start_at: startAt,
        location: location || undefined,
      });
      toast.success("予定を追加しました");
      resetForm();
      setOpen(false);
    } catch {
      toast.error("追加に失敗しました");
    }
  };

  const resetForm = () => {
    setTitle("");
    setDate(new Date().toISOString().split("T")[0]);
    setTime("");
    setIsAllDay(true);
    setLocation("");
    setDescription("");
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          size="icon"
          className="fixed bottom-20 right-4 z-40 h-14 w-14 rounded-full shadow-lg"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="mx-auto max-w-md rounded-t-2xl">
        <SheetHeader>
          <SheetTitle>予定を追加</SheetTitle>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">タイトル *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="例: ディナー"
              autoFocus
              required
            />
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={isAllDay}
                onChange={(e) => setIsAllDay(e.target.checked)}
                className="rounded"
              />
              終日
            </label>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="date">日付 *</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
            {!isAllDay && (
              <div className="space-y-2">
                <Label htmlFor="time">時間</Label>
                <Input
                  id="time"
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">場所</Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="場所"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">メモ</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="メモ"
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={addEvent.isPending}
          >
            {addEvent.isPending ? "追加中..." : "追加する"}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
