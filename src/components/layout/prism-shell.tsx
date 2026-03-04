"use client";

import { type ReactNode } from "react";
import { useMotionLevel } from "@/lib/hooks/use-motion-level";
import { cn } from "@/lib/utils";

/* ──────────────────────────────────────────────
 * PrismShell — レイアウトラッパー
 * ──────────────────────────────────────────────
 *  ● PrismBackdropDrift: 常時うっすらグラデ背景
 *  ● motionLevel=2 のときだけドリフトアニメ有効
 *  ● 1024px max-width 中央寄せ
 * ────────────────────────────────────────────── */

export function PrismShell({ children }: { children: ReactNode }) {
  const { allows } = useMotionLevel();
  const driftEnabled = allows(2);

  return (
    <>
      {/* PrismBackdropDrift layer */}
      <div
        className={cn(
          "prism-backdrop-layer",
          driftEnabled && "prism-backdrop"
        )}
        aria-hidden="true"
      />
      {/* Content — z-index不要。スタッキングコンテキストを作ると
          子要素のfixed z-50(BottomTabs)がシェル内に閉じ込められる */}
      <div className="relative">{children}</div>
    </>
  );
}
