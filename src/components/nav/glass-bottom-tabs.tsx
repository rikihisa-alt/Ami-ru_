"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion, LayoutGroup } from "framer-motion";
import {
  Home,
  Refrigerator,
  Calendar,
  Wallet,
  LayoutGrid,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ──────────────────────────────────────────────
 * GlassBottomTabs  — "Tab Morph" ナビゲーション
 * ──────────────────────────────────────────────
 *  ● 非選択 → 44px 正方形アイコン中心
 *  ● 選択   → 横伸び pill + ラベル出現
 *  ● Framer Motion layout + layoutId でスムーズモーフ
 *
 *  アニメーション名:
 *   GlassDockFloat  — 初回マウント: dock が下から浮き上がる (CSS)
 *   TabPressDip     — タップ時: scale(0.92) → 1
 *   TabMorphExpand  — pill の layoutId アニメーション
 *   TabIconNudge    — アイコン layout="position"
 *   TabLabelReveal  — ラベルの overflow-clip + opacity transition
 * ────────────────────────────────────────────── */

interface TabItem {
  key: string;
  href: string;
  label: string;
  icon: LucideIcon;
}

const TABS: TabItem[] = [
  { key: "home", href: "/home", label: "ホーム", icon: Home },
  { key: "pantry", href: "/pantry", label: "冷蔵庫", icon: Refrigerator },
  { key: "calendar", href: "/calendar", label: "予定", icon: Calendar },
  { key: "money", href: "/money", label: "お金", icon: Wallet },
  { key: "board", href: "/board", label: "ボード", icon: LayoutGrid },
];

/* ── Spring config ── */
const MORPH_SPRING = {
  type: "spring" as const,
  stiffness: 500,
  damping: 32,
  mass: 0.8,
};

export function GlassBottomTabs() {
  const pathname = usePathname();

  const activeKey =
    TABS.find((t) => pathname === t.href || pathname.startsWith(t.href + "/"))
      ?.key ?? "home";

  return (
    /* GlassDockFloat — CSS animation */
    <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden motion-safe:animate-dock-float">
      <div
        className="glass-dock mx-auto max-w-lg rounded-t-2xl"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        <LayoutGroup>
          <div className="flex h-16 items-center justify-around px-1.5">
            {TABS.map((tab) => (
              <TabButton
                key={tab.key}
                tab={tab}
                isActive={tab.key === activeKey}
              />
            ))}
          </div>
        </LayoutGroup>
      </div>
    </nav>
  );
}

/* ── 個別タブボタン ── */
function TabButton({ tab, isActive }: { tab: TabItem; isActive: boolean }) {
  const Icon = tab.icon;

  return (
    <Link
      href={tab.href}
      className="relative flex items-center justify-center"
      aria-label={tab.label}
    >
      {/* TabPressDip — タップ時 dip */}
      <motion.div
        className={cn(
          "relative flex items-center justify-center rounded-2xl",
          isActive
            ? "h-11 gap-2 px-4"
            : "h-11 w-11 text-muted-foreground hover:text-foreground",
        )}
        layout
        transition={MORPH_SPRING}
        whileTap={{ scale: 0.92, transition: { duration: 0.1 } }}
      >
        {/* TabMorphExpand — pill 背景が layoutId で移動 */}
        {isActive && (
          <motion.div
            layoutId="tab-pill"
            className="absolute inset-0 rounded-2xl dock-pill"
            transition={MORPH_SPRING}
            style={{ originX: 0.5, originY: 0.5 }}
          />
        )}

        {/* TabIconNudge — アイコン */}
        <motion.div
          layout="position"
          transition={MORPH_SPRING}
          className="relative z-10 flex-shrink-0"
        >
          <Icon
            className={cn(
              "h-5 w-5 transition-colors duration-200",
              isActive ? "text-primary" : "",
            )}
          />
        </motion.div>

        {/* TabLabelReveal — CSS でフェードイン、overflow clip で幅アニメーション */}
        <span
          className={cn(
            "relative z-10 overflow-hidden text-xs font-semibold text-primary whitespace-nowrap",
            "transition-all duration-300 ease-out",
            isActive
              ? "max-w-[60px] opacity-100"
              : "max-w-0 opacity-0",
          )}
        >
          {tab.label}
        </span>
      </motion.div>
    </Link>
  );
}
