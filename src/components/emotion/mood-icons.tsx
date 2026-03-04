"use client";

import { cn } from "@/lib/utils";

/* ═══════════════════════════════════════════════════════
 * Mood definitions — 10 variations (value 1–10)
 * warm → neutral → cool のグラデーション順
 * ═══════════════════════════════════════════════════════ */
export interface MoodDef {
  value: number;
  key: string;
  label: string;
  color: string;
  lightBg: string;
  faceColor: string;
}

export const MOOD_LIST: MoodDef[] = [
  { value: 10, key: "amazing",  label: "さいこう",  color: "#FFD93D", lightBg: "rgba(255,217,61,0.18)",  faceColor: "#8B6914" },
  { value: 9,  key: "happy",    label: "しあわせ",  color: "#FF87AB", lightBg: "rgba(255,135,171,0.18)", faceColor: "#8B2252" },
  { value: 8,  key: "glad",     label: "うれしい",  color: "#FFB347", lightBg: "rgba(255,179,71,0.18)",  faceColor: "#8B5A14" },
  { value: 7,  key: "good",     label: "いい感じ",  color: "#FF8E8E", lightBg: "rgba(255,142,142,0.18)", faceColor: "#8B3030" },
  { value: 6,  key: "cozy",     label: "ほんわか",  color: "#85E0C8", lightBg: "rgba(133,224,200,0.18)", faceColor: "#2D6B56" },
  { value: 5,  key: "neutral",  label: "ふつう",    color: "#B8C0D0", lightBg: "rgba(184,192,208,0.15)", faceColor: "#4A5068" },
  { value: 4,  key: "restless", label: "そわそわ",  color: "#7CC8C8", lightBg: "rgba(124,200,200,0.18)", faceColor: "#2B5E5E" },
  { value: 3,  key: "tired",    label: "つかれた",  color: "#9B8BF0", lightBg: "rgba(155,139,240,0.18)", faceColor: "#3D3270" },
  { value: 11, key: "angry",    label: "イライラ",  color: "#F06060", lightBg: "rgba(240,96,96,0.18)",  faceColor: "#6B2020" },
  { value: 2,  key: "gloomy",   label: "もやもや",  color: "#C88BC8", lightBg: "rgba(200,139,200,0.18)", faceColor: "#5E2D5E" },
  { value: 1,  key: "tough",    label: "つらい",    color: "#7BA8D4", lightBg: "rgba(123,168,212,0.18)", faceColor: "#2B4A6B" },
];

export function getMoodByValue(value: number): MoodDef | undefined {
  return MOOD_LIST.find((m) => m.value === value);
}

/* ═══════════════════════════════════════════════════════
 * MoodIcon — SVG ロゴタイプ風アイコン
 * ═══════════════════════════════════════════════════════ */
interface MoodIconProps {
  mood: MoodDef;
  size?: number;
  className?: string;
}

export function MoodIcon({ mood, size = 48, className }: MoodIconProps) {
  return (
    <svg
      viewBox="0 0 48 48"
      width={size}
      height={size}
      className={className}
      role="img"
      aria-label={mood.label}
    >
      {/* Background circle */}
      <circle cx="24" cy="24" r="22" fill={mood.color} />
      {/* Highlight (top-left gloss) */}
      <ellipse cx="18" cy="16" rx="10" ry="8" fill="white" opacity="0.25" />
      {/* Face */}
      {renderFace(mood.key, mood.faceColor)}
    </svg>
  );
}

function renderFace(key: string, fc: string) {
  switch (key) {
    // ── さいこう！ ✦ eyes, wide smile, sparkles ──
    case "amazing":
      return (
        <g>
          {/* ✦ Star eyes */}
          <path d="M16 19l0-3.5 0 3.5 3.5 0-3.5 0 0 3.5 0-3.5-3.5 0z" stroke={fc} strokeWidth="2" strokeLinecap="round" />
          <path d="M32 19l0-3.5 0 3.5 3.5 0-3.5 0 0 3.5 0-3.5-3.5 0z" stroke={fc} strokeWidth="2" strokeLinecap="round" />
          {/* Big wide smile */}
          <path d="M13 28c2 6 18 6 20 0" stroke={fc} strokeWidth="2.2" fill="none" strokeLinecap="round" />
          {/* Blush */}
          <circle cx="11" cy="26" r="3" fill={fc} opacity="0.12" />
          <circle cx="37" cy="26" r="3" fill={fc} opacity="0.12" />
          {/* Sparkle accent */}
          <circle cx="40" cy="10" r="1.5" fill="white" opacity="0.7" />
          <circle cx="42" cy="14" r="1" fill="white" opacity="0.5" />
        </g>
      );

    // ── しあわせ — closed happy eyes, big smile, hearts ──
    case "happy":
      return (
        <g>
          {/* Closed happy eyes (inverted arcs) */}
          <path d="M13 20c2-3 6-3 8 0" stroke={fc} strokeWidth="2.2" fill="none" strokeLinecap="round" />
          <path d="M27 20c2-3 6-3 8 0" stroke={fc} strokeWidth="2.2" fill="none" strokeLinecap="round" />
          {/* Wide smile */}
          <path d="M14 28c2 5 16 5 18 0" stroke={fc} strokeWidth="2.2" fill="none" strokeLinecap="round" />
          {/* Blush */}
          <circle cx="12" cy="25" r="3" fill={fc} opacity="0.12" />
          <circle cx="36" cy="25" r="3" fill={fc} opacity="0.12" />
          {/* Tiny heart accent */}
          <path d="M38 11c-1-2-4-2-4 1 0-3-3-3-4-1-1 3 4 5 4 5s5-2 4-5z" fill="white" opacity="0.5" transform="scale(0.6) translate(52,8)" />
        </g>
      );

    // ── うれしい — big bright eyes, cheerful smile ──
    case "glad":
      return (
        <g>
          {/* Big round eyes */}
          <circle cx="17" cy="20" r="3" fill={fc} />
          <circle cx="31" cy="20" r="3" fill={fc} />
          {/* Eye highlights */}
          <circle cx="18" cy="19" r="1.2" fill="white" />
          <circle cx="32" cy="19" r="1.2" fill="white" />
          {/* Cheerful smile */}
          <path d="M15 28c2 5 14 5 16 0" stroke={fc} strokeWidth="2.2" fill="none" strokeLinecap="round" />
          {/* Blush */}
          <circle cx="11" cy="26" r="3" fill={fc} opacity="0.12" />
          <circle cx="37" cy="26" r="3" fill={fc} opacity="0.12" />
        </g>
      );

    // ── いい感じ — wink + smile ──
    case "good":
      return (
        <g>
          {/* Left eye: wink (closed arc) */}
          <path d="M13 20c2-2.5 6-2.5 8 0" stroke={fc} strokeWidth="2.2" fill="none" strokeLinecap="round" />
          {/* Right eye: open dot */}
          <circle cx="31" cy="19" r="2.8" fill={fc} />
          <circle cx="32" cy="18" r="1.1" fill="white" />
          {/* Smile */}
          <path d="M16 28c2 4 12 4 14 0" stroke={fc} strokeWidth="2" fill="none" strokeLinecap="round" />
          {/* Blush */}
          <circle cx="12" cy="25" r="2.5" fill={fc} opacity="0.12" />
          <circle cx="36" cy="25" r="2.5" fill={fc} opacity="0.12" />
        </g>
      );

    // ── ほんわか — gentle half-moon eyes, soft smile ──
    case "cozy":
      return (
        <g>
          {/* Half-moon eyes (relaxed) */}
          <path d="M14 20c1.5-2 5-2 6.5 0" stroke={fc} strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M27.5 20c1.5-2 5-2 6.5 0" stroke={fc} strokeWidth="2" fill="none" strokeLinecap="round" />
          {/* Soft smile */}
          <path d="M18 27c1.5 3 9 3 10.5 0" stroke={fc} strokeWidth="2" fill="none" strokeLinecap="round" />
          {/* Rosy blush */}
          <circle cx="13" cy="25" r="3" fill={fc} opacity="0.15" />
          <circle cx="35" cy="25" r="3" fill={fc} opacity="0.15" />
        </g>
      );

    // ── ふつう — simple dots, straight mouth ──
    case "neutral":
      return (
        <g>
          {/* Dot eyes */}
          <circle cx="17" cy="20" r="2.5" fill={fc} />
          <circle cx="31" cy="20" r="2.5" fill={fc} />
          {/* Straight mouth */}
          <path d="M19 28h10" stroke={fc} strokeWidth="2" strokeLinecap="round" />
        </g>
      );

    // ── そわそわ — side-glancing eyes, wavy mouth ──
    case "restless":
      return (
        <g>
          {/* Looking-right eyes */}
          <circle cx="18" cy="20" r="2.5" fill={fc} />
          <circle cx="32" cy="20" r="2.5" fill={fc} />
          <circle cx="19.2" cy="19.5" r="1" fill="white" />
          <circle cx="33.2" cy="19.5" r="1" fill="white" />
          {/* Wavy mouth */}
          <path d="M17 28c2 2 4-2 6 0 2 2 4-2 6 0" stroke={fc} strokeWidth="1.8" fill="none" strokeLinecap="round" />
          {/* Tiny sweat drop */}
          <ellipse cx="37" cy="16" rx="1.5" ry="2.2" fill="white" opacity="0.6" />
        </g>
      );

    // ── つかれた — sleepy droopy eyes, yawn mouth ──
    case "tired":
      return (
        <g>
          {/* Droopy closed eyes */}
          <path d="M13 19c2 2 6 2 8 0" stroke={fc} strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M27 19c2 2 6 2 8 0" stroke={fc} strokeWidth="2" fill="none" strokeLinecap="round" />
          {/* Small open mouth (yawn) */}
          <ellipse cx="24" cy="29" rx="3.5" ry="2.8" fill={fc} opacity="0.7" />
          <ellipse cx="24" cy="28.5" rx="2.5" ry="1.8" fill="white" opacity="0.3" />
          {/* Zzz */}
          <text x="36" y="14" fill="white" opacity="0.6" fontSize="7" fontWeight="bold">z</text>
          <text x="39" y="10" fill="white" opacity="0.4" fontSize="5" fontWeight="bold">z</text>
        </g>
      );

    // ── イライラ — angry V-brows, clenched mouth, vein mark ──
    case "angry":
      return (
        <g>
          {/* Angry V-shaped brows (steep inward) */}
          <path d="M11 16l9 5" stroke={fc} strokeWidth="2.2" fill="none" strokeLinecap="round" />
          <path d="M37 16l-9 5" stroke={fc} strokeWidth="2.2" fill="none" strokeLinecap="round" />
          {/* Eyes */}
          <circle cx="17" cy="23" r="2.3" fill={fc} />
          <circle cx="31" cy="23" r="2.3" fill={fc} />
          {/* Clenched frown */}
          <path d="M19 31c2-2.5 8-2.5 10 0" stroke={fc} strokeWidth="2" fill="none" strokeLinecap="round" />
          {/* Anger vein mark (プンプン) */}
          <g transform="translate(35,8)">
            <rect x="0" y="1.8" width="5" height="1.4" rx="0.7" fill="white" opacity="0.55" />
            <rect x="1.8" y="0" width="1.4" height="5" rx="0.7" fill="white" opacity="0.55" />
          </g>
        </g>
      );

    // ── もやもや — worried brows, squiggly mouth ──
    case "gloomy":
      return (
        <g>
          {/* Worried brows */}
          <path d="M13 15c2-1.5 5-0.5 7 0" stroke={fc} strokeWidth="1.5" fill="none" strokeLinecap="round" />
          <path d="M28 15c2 0.5 5-1 7 0" stroke={fc} strokeWidth="1.5" fill="none" strokeLinecap="round" />
          {/* Dot eyes */}
          <circle cx="17" cy="21" r="2.3" fill={fc} />
          <circle cx="31" cy="21" r="2.3" fill={fc} />
          {/* Squiggly mouth */}
          <path d="M18 29c1.5 1.5 3-1.5 4.5 0 1.5 1.5 3-1.5 4.5 0" stroke={fc} strokeWidth="1.8" fill="none" strokeLinecap="round" />
          {/* Cloud puff accent */}
          <circle cx="39" cy="11" r="2.5" fill="white" opacity="0.25" />
          <circle cx="36" cy="13" r="2" fill="white" opacity="0.2" />
        </g>
      );

    // ── つらい — sad eyes with tear, frown ──
    case "tough":
      return (
        <g>
          {/* Sad eyes */}
          <circle cx="17" cy="20" r="2.5" fill={fc} />
          <circle cx="31" cy="20" r="2.5" fill={fc} />
          {/* Eye highlights (dim) */}
          <circle cx="18" cy="19.5" r="0.8" fill="white" opacity="0.5" />
          <circle cx="32" cy="19.5" r="0.8" fill="white" opacity="0.5" />
          {/* Sad brows */}
          <path d="M13 16c2 1.5 5 0 7-1" stroke={fc} strokeWidth="1.5" fill="none" strokeLinecap="round" />
          <path d="M28 15c2-1 5-2.5 7-1" stroke={fc} strokeWidth="1.5" fill="none" strokeLinecap="round" />
          {/* Frown */}
          <path d="M18 31c2-3.5 10-3.5 12 0" stroke={fc} strokeWidth="2" fill="none" strokeLinecap="round" />
          {/* Tear drop */}
          <path d="M14 23c0 0-1.5 3-1.5 4.5a1.5 1.5 0 003 0c0-1.5-1.5-4.5-1.5-4.5z" fill="white" opacity="0.6" />
        </g>
      );

    default:
      return (
        <g>
          <circle cx="17" cy="20" r="2.5" fill={fc} />
          <circle cx="31" cy="20" r="2.5" fill={fc} />
          <path d="M19 28h10" stroke={fc} strokeWidth="2" strokeLinecap="round" />
        </g>
      );
  }
}
