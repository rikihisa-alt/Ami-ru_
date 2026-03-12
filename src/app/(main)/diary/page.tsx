"use client";

import { useState } from "react";
import { useUser } from "@/providers/supabase-provider";
import { useDiaryEntries, useAddDiaryEntry, useDeleteDiaryEntry } from "@/hooks/use-diary";
import { cn } from "@/lib/utils";
import {
  BookOpen,
  Plus,
  X,
  ChevronLeft,
  ChevronRight,
  Cloud,
  Sun,
  CloudRain,
  Snowflake,
  Trash2,
} from "lucide-react";

/* ── 天気アイコン ── */
const WEATHER_OPTIONS = [
  { value: "sunny", label: "晴れ", icon: Sun },
  { value: "cloudy", label: "曇り", icon: Cloud },
  { value: "rainy", label: "雨", icon: CloudRain },
  { value: "snowy", label: "雪", icon: Snowflake },
] as const;

const weatherIcon = (w: string | null | undefined) => {
  const opt = WEATHER_OPTIONS.find((o) => o.value === w);
  if (!opt) return null;
  const Icon = opt.icon;
  return <Icon className="h-4 w-4 text-muted-foreground" />;
};

/* ── 気分 ── */
const MOOD_EMOJIS = ["😢", "😔", "😐", "😊", "😆"] as const;

export default function DiaryPage() {
  const { user, profile } = useUser();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [isWriting, setIsWriting] = useState(false);

  const { data: entries, isLoading } = useDiaryEntries(year, month);
  const addMutation = useAddDiaryEntry();
  const deleteMutation = useDeleteDiaryEntry();

  /* ── 月送り ── */
  const prevMonth = () => {
    if (month === 0) { setYear(year - 1); setMonth(11); }
    else setMonth(month - 1);
  };
  const nextMonth = () => {
    if (month === 11) { setYear(year + 1); setMonth(0); }
    else setMonth(month + 1);
  };

  /* ── 新規投稿 ── */
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [mood, setMood] = useState<number | null>(null);
  const [weather, setWeather] = useState<string>("");

  const handleSubmit = async () => {
    if (!body.trim()) return;
    try {
      await addMutation.mutateAsync({
        title: title.trim() || undefined,
        body: body.trim(),
        mood: mood ?? undefined,
        weather: weather || undefined,
        entry_date: new Date().toISOString().split("T")[0],
      });
      setTitle("");
      setBody("");
      setMood(null);
      setWeather("");
      setIsWriting(false);
    } catch {
      // error handled by mutation
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("この日記を削除しますか？")) return;
    await deleteMutation.mutateAsync(id);
  };

  return (
    <div className="space-y-5 motion-safe:animate-page-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-muted-foreground" />
          <h1 className="text-[20px] font-bold tracking-tight text-foreground">日記</h1>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={prevMonth} className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="min-w-[100px] text-center text-[14px] font-medium text-foreground">
            {year}年{month + 1}月
          </span>
          <button onClick={nextMonth} className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* 新規作成フォーム */}
      {isWriting ? (
        <div className="rounded-xl border border-border bg-card p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-[15px] font-semibold text-foreground">日記を書く</h2>
            <button onClick={() => setIsWriting(false)} className="rounded-lg p-1 text-muted-foreground hover:bg-muted">
              <X className="h-4 w-4" />
            </button>
          </div>

          <input
            type="text"
            placeholder="タイトル（省略可）"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-[15px] placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/30"
          />

          <textarea
            placeholder="今日はどんな一日だった？"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={5}
            className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-[15px] leading-relaxed placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/30"
          />

          {/* 気分 */}
          <div className="space-y-1.5">
            <label className="text-[13px] font-medium text-muted-foreground">気分</label>
            <div className="flex gap-2">
              {MOOD_EMOJIS.map((emoji, i) => (
                <button
                  key={i}
                  onClick={() => setMood(mood === i + 1 ? null : i + 1)}
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-full text-lg transition-all",
                    mood === i + 1
                      ? "bg-primary/10 ring-2 ring-primary/40 scale-110"
                      : "hover:bg-muted"
                  )}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* 天気 */}
          <div className="space-y-1.5">
            <label className="text-[13px] font-medium text-muted-foreground">天気</label>
            <div className="flex gap-2">
              {WEATHER_OPTIONS.map((w) => (
                <button
                  key={w.value}
                  onClick={() => setWeather(weather === w.value ? "" : w.value)}
                  className={cn(
                    "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[13px] transition-all",
                    weather === w.value
                      ? "bg-primary/10 text-primary ring-1 ring-primary/30"
                      : "bg-muted/50 text-muted-foreground hover:bg-muted"
                  )}
                >
                  <w.icon className="h-3.5 w-3.5" />
                  {w.label}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={!body.trim() || addMutation.isPending}
            className="w-full rounded-xl bg-primary py-2.5 text-[15px] font-medium text-primary-foreground transition-colors disabled:opacity-50"
          >
            {addMutation.isPending ? "保存中..." : "保存する"}
          </button>
        </div>
      ) : null}

      {/* エントリー一覧 */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : entries?.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <BookOpen className="h-10 w-10 text-muted-foreground/40" />
          <div>
            <p className="text-[15px] font-medium text-foreground">まだ日記がありません</p>
            <p className="mt-1 text-[13px] text-muted-foreground">
              ふたりの毎日を記録しよう
            </p>
          </div>
          <button
            onClick={() => setIsWriting(true)}
            className="mt-2 rounded-lg border border-border px-4 py-2 text-[13px] font-medium text-foreground transition-colors hover:bg-muted"
          >
            書いてみる
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {entries?.map((entry: {
            id: string;
            title: string | null;
            body: string;
            mood: number | null;
            weather: string | null;
            entry_date: string;
            created_by: string;
          }) => {
            const isOwn = entry.created_by === user?.id;
            const dateObj = new Date(entry.entry_date + "T00:00:00");
            const dayStr = `${dateObj.getMonth() + 1}/${dateObj.getDate()}`;
            const weekDay = ["日", "月", "火", "水", "木", "金", "土"][dateObj.getDay()];

            return (
              <article
                key={entry.id}
                className="rounded-xl border border-border bg-card p-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-medium text-muted-foreground">
                      {dayStr}({weekDay})
                    </span>
                    {entry.mood && (
                      <span className="text-sm">{MOOD_EMOJIS[(entry.mood - 1)] ?? ""}</span>
                    )}
                    {weatherIcon(entry.weather)}
                    {!isOwn && (
                      <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[11px] font-medium text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                        パートナー
                      </span>
                    )}
                  </div>
                  {isOwn && (
                    <button
                      onClick={() => handleDelete(entry.id)}
                      className="rounded-lg p-1 text-muted-foreground/50 hover:bg-muted hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                {entry.title && (
                  <h3 className="mt-1.5 text-[15px] font-semibold text-foreground">
                    {entry.title}
                  </h3>
                )}
                <p className="mt-1.5 whitespace-pre-wrap text-[14px] leading-relaxed text-foreground/80">
                  {entry.body}
                </p>
              </article>
            );
          })}
        </div>
      )}

      {/* FAB */}
      {!isWriting && (
        <button
          onClick={() => setIsWriting(true)}
          className="fixed bottom-24 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform active:scale-95 lg:bottom-8 lg:right-8"
        >
          <Plus className="h-6 w-6" />
        </button>
      )}
    </div>
  );
}
