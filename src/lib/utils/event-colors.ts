export interface EventColor {
  value: string;
  label: string;
  dot: string;
  bg: string;
  chip: string;
  band: string;
}

export const EVENT_COLORS: EventColor[] = [
  {
    value: "primary",
    label: "デフォルト",
    dot: "bg-primary",
    bg: "bg-primary/10",
    chip: "bg-primary/10 text-primary border-primary/20",
    band: "bg-primary/30",
  },
  {
    value: "violet",
    label: "紫",
    dot: "bg-violet-400",
    bg: "bg-violet-50 dark:bg-violet-950/40",
    chip: "bg-violet-50 text-violet-600 border-violet-200 dark:bg-violet-950/40 dark:text-violet-400",
    band: "bg-violet-400/30",
  },
  {
    value: "sky",
    label: "青",
    dot: "bg-sky-400",
    bg: "bg-sky-50 dark:bg-sky-950/40",
    chip: "bg-sky-50 text-sky-600 border-sky-200 dark:bg-sky-950/40 dark:text-sky-400",
    band: "bg-sky-400/30",
  },
  {
    value: "rose",
    label: "ピンク",
    dot: "bg-rose-400",
    bg: "bg-rose-50 dark:bg-rose-950/40",
    chip: "bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400",
    band: "bg-rose-400/30",
  },
  {
    value: "emerald",
    label: "緑",
    dot: "bg-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-950/40",
    chip: "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400",
    band: "bg-emerald-400/30",
  },
  {
    value: "amber",
    label: "黄",
    dot: "bg-amber-400",
    bg: "bg-amber-50 dark:bg-amber-950/40",
    chip: "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400",
    band: "bg-amber-400/30",
  },
];

export function getEventColor(value: string): EventColor {
  return EVENT_COLORS.find((c) => c.value === value) ?? EVENT_COLORS[0];
}
