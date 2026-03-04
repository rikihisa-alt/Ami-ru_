"use client";

import { PrismButton } from "@/components/ui/prism-button";
import { PrismCard } from "@/components/ui/prism-card";
import { PrismShell } from "@/components/layout/prism-shell";
import { useMotionLevel, type MotionLevel } from "@/lib/hooks/use-motion-level";
import { Badge } from "@/components/ui/badge";
import {
  Home,
  Calendar,
  Wallet,
  Refrigerator,
  LayoutGrid,
  Sparkles,
  Zap,
  Heart,
} from "lucide-react";
import { cn } from "@/lib/utils";

const MOTION_LABELS: Record<MotionLevel, string> = {
  0: "OFF",
  1: "NORMAL",
  2: "RICH",
};

export default function PrismDemoPage() {
  const { level, setLevel } = useMotionLevel();

  return (
    <PrismShell>
      <div className="mx-auto max-w-2xl space-y-8 px-4 py-8">
        {/* Title */}
        <div className="text-center motion-safe:animate-prism-fade-up">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            PRISM FLOW
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Design System Demo — Ami-ru
          </p>
        </div>

        {/* Motion Level Control */}
        <PrismCard variant="elevated" animationIndex={0}>
          <div className="flex items-center gap-2.5 pb-3">
            <Zap className="h-5 w-5 text-amber-400" />
            <h2 className="font-semibold">Motion Level</h2>
            <Badge variant="secondary" className="ml-auto rounded-full">
              {MOTION_LABELS[level]}
            </Badge>
          </div>
          <div className="flex gap-2">
            {([0, 1, 2] as MotionLevel[]).map((l) => (
              <PrismButton
                key={l}
                variant={level === l ? "primary" : "secondary"}
                size="sm"
                className="flex-1"
                onClick={() => setLevel(l)}
              >
                {MOTION_LABELS[l]}
              </PrismButton>
            ))}
          </div>
        </PrismCard>

        {/* Buttons */}
        <PrismCard animationIndex={1}>
          <h2 className="pb-3 font-semibold">Buttons — ButtonMagneticPress</h2>
          <div className="flex flex-wrap gap-3">
            <PrismButton variant="primary">Primary</PrismButton>
            <PrismButton variant="secondary">Secondary</PrismButton>
            <PrismButton variant="ghost">Ghost</PrismButton>
            <PrismButton variant="danger">Danger</PrismButton>
            <PrismButton variant="primary" size="sm">Small</PrismButton>
            <PrismButton variant="primary" size="lg">Large</PrismButton>
            <PrismButton variant="primary" shimmer>
              <Sparkles className="h-4 w-4" /> Shimmer
            </PrismButton>
          </div>
        </PrismCard>

        {/* Cards */}
        <div>
          <h2 className="pb-3 font-semibold motion-safe:animate-prism-fade-up">
            Cards — CardFloatLift
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <PrismCard hoverable animationIndex={2}>
              <div className="flex items-center gap-2.5 pb-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-100/80 text-violet-500">
                  <Calendar className="h-4 w-4" />
                </div>
                <p className="text-sm font-semibold">Surface Card</p>
              </div>
              <p className="text-sm text-muted-foreground">
                Default prism-surface with hover float lift
              </p>
            </PrismCard>

            <PrismCard variant="elevated" hoverable animationIndex={3}>
              <div className="flex items-center gap-2.5 pb-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-orange-100/80 text-orange-500">
                  <Refrigerator className="h-4 w-4" />
                </div>
                <p className="text-sm font-semibold">Elevated Card</p>
              </div>
              <p className="text-sm text-muted-foreground">
                Elevated variant with stronger blur
              </p>
            </PrismCard>

            <PrismCard variant="flat" hoverable animationIndex={4}>
              <div className="flex items-center gap-2.5 pb-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-sky-100/80 text-sky-500">
                  <Wallet className="h-4 w-4" />
                </div>
                <p className="text-sm font-semibold">Flat Card</p>
              </div>
              <p className="text-sm text-muted-foreground">
                Simple bg-card border style
              </p>
            </PrismCard>

            <PrismCard variant="accent" hoverable animationIndex={5}>
              <div className="flex items-center gap-2.5 pb-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-100/80 text-rose-500">
                  <Heart className="h-4 w-4" />
                </div>
                <p className="text-sm font-semibold">Accent Card</p>
              </div>
              <p className="text-sm text-muted-foreground">
                Primary-tinted accent variant
              </p>
            </PrismCard>
          </div>
        </div>

        {/* Shimmer */}
        <PrismCard animationIndex={6}>
          <h2 className="pb-3 font-semibold">Shimmer — ShimmerHint</h2>
          <div className="flex gap-3">
            <Badge className="prism-shimmer rounded-full bg-primary px-3 py-1 text-primary-foreground">
              NEW
            </Badge>
            <Badge className="prism-shimmer rounded-full bg-violet-500 px-3 py-1 text-white">
              3件
            </Badge>
            <Badge className="prism-shimmer rounded-full bg-rose-500 px-3 py-1 text-white">
              期限切れ
            </Badge>
          </div>
        </PrismCard>

        {/* Icons */}
        <PrismCard animationIndex={7}>
          <h2 className="pb-3 font-semibold">Tab Icons</h2>
          <div className="flex justify-around">
            {[Home, Refrigerator, Calendar, Wallet, LayoutGrid].map((Icon, i) => (
              <div
                key={i}
                className={cn(
                  "flex h-12 w-12 items-center justify-center rounded-2xl transition-all duration-200",
                  "hover:bg-secondary active:scale-90",
                  "motion-safe:animate-prism-fade-up"
                )}
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <Icon className="h-5 w-5 text-muted-foreground" />
              </div>
            ))}
          </div>
        </PrismCard>

        {/* Color tokens */}
        <PrismCard animationIndex={8}>
          <h2 className="pb-3 font-semibold">Accent Colors</h2>
          <div className="flex gap-3">
            <div className="flex flex-col items-center gap-1">
              <div className="h-10 w-10 rounded-xl bg-[var(--prism-accent1)]" />
              <span className="text-[10px] text-muted-foreground">Accent 1</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="h-10 w-10 rounded-xl bg-[var(--prism-accent2)]" />
              <span className="text-[10px] text-muted-foreground">Accent 2</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="h-10 w-10 rounded-xl bg-[var(--prism-accent3)]" />
              <span className="text-[10px] text-muted-foreground">Accent 3</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="h-10 w-10 rounded-xl bg-primary" />
              <span className="text-[10px] text-muted-foreground">Primary</span>
            </div>
          </div>
        </PrismCard>
      </div>
    </PrismShell>
  );
}
