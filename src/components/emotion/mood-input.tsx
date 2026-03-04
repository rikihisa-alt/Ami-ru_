"use client";

import { useState } from "react";
import { useTodayMood, useAddMoodLog } from "@/lib/hooks/use-moods";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const MOODS = [
  { value: 5, emoji: "😊", label: "いい感じ" },
  { value: 4, emoji: "🙂", label: "まあまあ" },
  { value: 3, emoji: "😐", label: "ふつう" },
  { value: 2, emoji: "😟", label: "ちょっと…" },
  { value: 1, emoji: "😢", label: "つらい" },
];

export function MoodInput() {
  const { data: todayMood, isLoading } = useTodayMood();
  const addMood = useAddMoodLog();
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [note, setNote] = useState("");
  const [showNote, setShowNote] = useState(false);

  const handleSelectMood = async (mood: number) => {
    setSelectedMood(mood);
    // ノート入力欄を一瞬見せる（任意入力なのでスキップ可）
    setShowNote(true);
  };

  const handleSubmit = async () => {
    if (!selectedMood) return;

    try {
      await addMood.mutateAsync({
        mood: selectedMood,
        note: note.trim() || undefined,
      });
      setSelectedMood(null);
      setNote("");
      setShowNote(false);
      toast.success("きろくしたよ 📝");
    } catch {
      toast.error("記録に失敗しました");
    }
  };

  const handleSkipNote = async () => {
    if (!selectedMood) return;

    try {
      await addMood.mutateAsync({ mood: selectedMood });
      setSelectedMood(null);
      setNote("");
      setShowNote(false);
      toast.success("きろくしたよ 📝");
    } catch {
      toast.error("記録に失敗しました");
    }
  };

  if (isLoading) {
    return (
      <Card className="p-4">
        <div className="h-16 animate-pulse rounded-xl bg-muted" />
      </Card>
    );
  }

  // 既に今日記録済み
  if (todayMood) {
    const recorded = MOODS.find((m) => m.value === todayMood.mood);
    return (
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">今日のきもち</p>
            <div className="mt-1 flex items-center gap-2">
              <span className="text-2xl">{recorded?.emoji ?? "😐"}</span>
              <span className="text-sm text-muted-foreground">
                {recorded?.label}
              </span>
            </div>
          </div>
          {todayMood.note && (
            <p className="max-w-[120px] truncate text-xs text-muted-foreground italic">
              {todayMood.note}
            </p>
          )}
        </div>
      </Card>
    );
  }

  // ノート入力モード
  if (showNote && selectedMood) {
    const selected = MOODS.find((m) => m.value === selectedMood);
    return (
      <Card className="space-y-3 p-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{selected?.emoji}</span>
          <span className="text-sm">{selected?.label}</span>
        </div>
        <Input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="ひとこと（任意）"
          className="text-sm"
          maxLength={100}
        />
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={handleSkipNote}
            disabled={addMood.isPending}
          >
            スキップ
          </Button>
          <Button
            size="sm"
            className="flex-1"
            onClick={handleSubmit}
            disabled={addMood.isPending}
          >
            記録する
          </Button>
        </div>
      </Card>
    );
  }

  // 初期状態：5つの顔から選ぶ
  return (
    <Card className="p-4">
      <p className="mb-3 text-xs text-muted-foreground">
        今のきもちは？
      </p>
      <div className="flex justify-between">
        {MOODS.map((mood) => (
          <button
            key={mood.value}
            onClick={() => handleSelectMood(mood.value)}
            className={cn(
              "flex flex-col items-center gap-1 rounded-xl px-2 py-1.5 transition-all",
              "hover:bg-muted active:scale-95",
              selectedMood === mood.value && "bg-primary/10"
            )}
          >
            <span className="text-2xl">{mood.emoji}</span>
            <span className="text-[10px] text-muted-foreground">
              {mood.label}
            </span>
          </button>
        ))}
      </div>
    </Card>
  );
}
