"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import { MoodIcon, type MoodDef } from "./mood-icons";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/* ═══════════════════════════════════════════════════════
 * MoodCelebration — ロゴ弾け＋パーティクル＋メッセージ
 *
 * Flow:
 *   1. Overlay slides up from bottom
 *   2. Mood icon pops with elastic bounce
 *   3. Particles burst outward (16 circles + 6 sparkles)
 *   4. "本日の気持ちを登録しました" slides in
 *   5. Optional note input
 *   6. Auto-dismiss after 3.5s or user submit
 * ═══════════════════════════════════════════════════════ */

interface MoodCelebrationProps {
  mood: MoodDef;
  onSubmitNote: (note?: string) => void;
  onDismiss: () => void;
}

export function MoodCelebration({ mood, onSubmitNote, onDismiss }: MoodCelebrationProps) {
  const [phase, setPhase] = useState<"burst" | "message" | "note" | "exit">("burst");
  const [note, setNote] = useState("");
  const [exiting, setExiting] = useState(false);

  // Generate particles once
  const particles = useMemo(() => generateParticles(mood.color), [mood.color]);
  const sparkles = useMemo(() => generateSparkles(), []);

  // Phase timing
  useEffect(() => {
    const t1 = setTimeout(() => setPhase("message"), 600);
    const t2 = setTimeout(() => setPhase("note"), 1200);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  // Auto-dismiss timer (pause if note has content)
  useEffect(() => {
    if (phase !== "note" || note.length > 0) return;
    const timer = setTimeout(() => handleDismiss(), 3500);
    return () => clearTimeout(timer);
  }, [phase, note]);

  const handleDismiss = useCallback(() => {
    if (exiting) return;
    setExiting(true);
    // Fire note submit if any
    if (note.trim()) {
      onSubmitNote(note.trim());
    } else {
      onSubmitNote(undefined);
    }
    setTimeout(onDismiss, 350);
  }, [exiting, note, onSubmitNote, onDismiss]);

  const handleSendNote = () => {
    onSubmitNote(note.trim() || undefined);
    setExiting(true);
    setTimeout(onDismiss, 350);
  };

  const overlay = (
    <div
      className={cn(
        "fixed inset-0 z-[100] flex flex-col items-center justify-center",
        "bg-background/60 backdrop-blur-md",
      )}
      style={{
        animation: exiting
          ? "mood-overlay-exit 0.35s ease-in forwards"
          : "mood-overlay-enter 0.35s cubic-bezier(0.16,1,0.3,1) both",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && phase === "note") handleDismiss();
      }}
    >
      {/* ── Particles layer ── */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        {particles.map((p, i) => (
          <span
            key={`p-${i}`}
            className="absolute rounded-full"
            style={{
              width: p.size,
              height: p.size,
              background: p.color,
              "--px": `${p.x}px`,
              "--py": `${p.y}px`,
              animation: `mood-particle-burst 0.7s ${p.delay}s cubic-bezier(0.16,1,0.3,1) both`,
            } as React.CSSProperties}
          />
        ))}
        {sparkles.map((s, i) => (
          <svg
            key={`s-${i}`}
            className="absolute"
            width="14"
            height="14"
            viewBox="0 0 14 14"
            style={{
              left: `calc(50% + ${s.x}px - 7px)`,
              top: `calc(50% + ${s.y}px - 7px)`,
              animation: `mood-sparkle 0.6s ${s.delay}s ease-out both`,
            }}
          >
            <path
              d="M7 0L8.5 5.5L14 7L8.5 8.5L7 14L5.5 8.5L0 7L5.5 5.5Z"
              fill={mood.color}
              opacity="0.7"
            />
          </svg>
        ))}
      </div>

      {/* ── Icon ── */}
      <div
        className="relative z-10"
        style={{
          animation: "mood-icon-pop 0.65s cubic-bezier(0.34,1.56,0.64,1) both",
        }}
      >
        <MoodIcon mood={mood} size={88} />
      </div>

      {/* ── Label ── */}
      <p
        className="relative z-10 mt-3 text-lg font-bold"
        style={{
          color: mood.color,
          animation: phase !== "burst"
            ? "mood-text-reveal 0.4s 0.1s cubic-bezier(0.16,1,0.3,1) both"
            : undefined,
          opacity: phase === "burst" ? 0 : undefined,
          filter: `drop-shadow(0 0 8px ${mood.color}40)`,
        }}
      >
        {mood.label}
      </p>

      {/* ── Message ── */}
      <p
        className="relative z-10 mt-2 text-sm text-muted-foreground"
        style={{
          animation: phase !== "burst"
            ? "mood-text-reveal 0.4s 0.2s cubic-bezier(0.16,1,0.3,1) both"
            : undefined,
          opacity: phase === "burst" ? 0 : undefined,
        }}
      >
        本日のきもちを記録しました
      </p>

      {/* ── Note input (appears last) ── */}
      {phase === "note" && !exiting && (
        <div
          className="relative z-10 mx-4 mt-6 flex w-full max-w-xs gap-2"
          style={{
            animation: "mood-text-reveal 0.35s cubic-bezier(0.16,1,0.3,1) both",
          }}
        >
          <Input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="ひとこと添える？（任意）"
            className="flex-1 rounded-full border-[var(--glass-border)] bg-[var(--glass-bg)] text-sm backdrop-blur-sm"
            maxLength={100}
            autoFocus
            onKeyDown={(e) => e.key === "Enter" && handleSendNote()}
          />
          {note.trim() && (
            <button
              onClick={handleSendNote}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white transition-transform active:scale-90"
              style={{ background: mood.color }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </div>
      )}
    </div>
  );

  if (typeof window === "undefined") return null;
  return createPortal(overlay, document.body);
}

/* ── Particle generation helpers ── */

function generateParticles(baseColor: string) {
  const count = 16;
  return Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.4;
    const dist = 55 + Math.random() * 45;
    return {
      x: Math.cos(angle) * dist,
      y: Math.sin(angle) * dist,
      size: 5 + Math.random() * 7,
      delay: Math.random() * 0.15,
      color: i % 3 === 0 ? baseColor : i % 3 === 1 ? `${baseColor}BB` : `${baseColor}77`,
    };
  });
}

function generateSparkles() {
  return Array.from({ length: 6 }, (_, i) => {
    const angle = (i / 6) * Math.PI * 2 + Math.PI / 6;
    const dist = 70 + Math.random() * 30;
    return {
      x: Math.cos(angle) * dist,
      y: Math.sin(angle) * dist,
      delay: 0.1 + Math.random() * 0.2,
    };
  });
}
