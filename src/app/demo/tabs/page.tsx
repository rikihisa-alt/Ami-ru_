"use client";

import { GlassBottomTabs } from "@/components/nav/glass-bottom-tabs";

export default function DemoTabsPage() {
  return (
    <div className="min-h-svh bg-background p-6">
      <h1 className="mb-4 text-xl font-bold text-foreground">
        Glass Bottom Tabs — Demo
      </h1>
      <p className="mb-2 text-sm text-muted-foreground">
        下部のタブをタップして Tab Morph アニメーションを確認してください。
      </p>
      <ul className="space-y-1.5 text-sm text-muted-foreground">
        <li>● <b>GlassDockFloat</b> — Dock が下から浮き上がる初回アニメーション</li>
        <li>● <b>TabPressDip</b> — タップ時 scale(0.92) → 1</li>
        <li>● <b>TabMorphExpand</b> — 選択タブが pill 型に横伸び</li>
        <li>● <b>TabIconNudge</b> — アイコンが左に微移動</li>
        <li>● <b>TabLabelReveal</b> — ラベルがフェードイン</li>
        <li>● <b>GlassSheen</b> — pill のガラスシーン効果</li>
      </ul>

      {/* スタンドアロンで表示 */}
      <GlassBottomTabs />
    </div>
  );
}
