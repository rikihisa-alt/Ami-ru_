"use client";

import { useState, useCallback } from "react";
import { useTodayMood, useAddMoodLog } from "@/lib/hooks/use-moods";
import { GlassCard } from "@/components/ui/glass-card";
import { MOOD_LIST, MoodIcon, getMoodByValue, type MoodDef } from "./mood-icons";
import { MoodCelebration } from "./mood-celebration";
import { cn } from "@/lib/utils";

export function EmotionSelector() {
  const { data: todayMood } = useTodayMood();
  const addMood = useAddMoodLog();
  const [celebrating, setCelebrating] = useState<MoodDef | null>(null);

  /* ── タップ → 即座にセレブレーション + 並行で記録 ── */
  const handleSelect = useCallback(
    (mood: MoodDef) => {
      setCelebrating(mood);
      addMood.mutateAsync({ mood: mood.value }).catch(() => {});
    },
    [addMood],
  );

  /* ── セレブレーション中にノートが送られた ── */
  const handleNoteSubmit = useCallback(
    async (note?: string) => {
      if (!note) return;
      try {
        await addMood.mutateAsync({
          mood: celebrating?.value ?? todayMood?.mood ?? 5,
          note,
        });
      } catch {
        // silent — メインの記録は成功済み
      }
    },
    [addMood, celebrating, todayMood],
  );

  /* ── 記録済み表示（スケルトンなし → 即座にUI表示）── */
  if (todayMood && !celebrating) {
    const recorded = getMoodByValue(todayMood.mood);
    return (
      <GlassCard className="motion-safe:animate-soft-scale-in">
        <div className="flex items-center gap-3">
          <div
            className="flex h-11 w-11 items-center justify-center rounded-2xl"
            style={{ background: recorded?.lightBg }}
          >
            {recorded && <MoodIcon mood={recorded} size={36} />}
          </div>
          <div className="flex-1">
            <p className="text-[11px] text-muted-foreground">今日のきもち</p>
            <p className="text-sm font-semibold">{recorded?.label ?? "記録済み"}</p>
          </div>
          {todayMood.note && (
            <p className="max-w-[140px] truncate rounded-full bg-muted/50 px-3 py-1 text-xs text-muted-foreground">
              {todayMood.note}
            </p>
          )}
        </div>
      </GlassCard>
    );
  }

  /* ── 初期状態：10種のムードアイコンを表示 ── */
  return (
    <>
      <GlassCard>
        <p className="mb-3 text-xs font-medium text-muted-foreground">
          今のきもちは？
        </p>
        <div className="grid grid-cols-5 gap-1.5">
          {MOOD_LIST.map((mood) => (
            <button
              key={mood.value}
              onClick={() => handleSelect(mood)}
              disabled={addMood.isPending}
              className={cn(
                "flex flex-col items-center gap-1 rounded-xl py-1.5 transition-all duration-150",
                "hover:bg-[var(--glass-bg-hover)]",
                "active:scale-[0.88]",
                "disabled:pointer-events-none disabled:opacity-50",
              )}
            >
              <MoodIcon mood={mood} size={40} />
              <span className="text-[9px] leading-tight text-muted-foreground">
                {mood.label}
              </span>
            </button>
          ))}
        </div>
      </GlassCard>

      {/* ── セレブレーション overlay ── */}
      {celebrating && (
        <MoodCelebration
          mood={celebrating}
          onSubmitNote={handleNoteSubmit}
          onDismiss={() => setCelebrating(null)}
        />
      )}
    </>
  );
}
