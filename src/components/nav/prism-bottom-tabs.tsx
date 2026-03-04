"use client";

import { usePathname, useRouter } from "next/navigation";
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
import { useMotionLevel } from "@/lib/hooks/use-motion-level";

/* ──────────────────────────────────────────────
 * PrismBottomTabs  — TabMorphDock5
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

const MORPH_SPRING = {
  type: "spring" as const,
  stiffness: 520,
  damping: 34,
  mass: 0.8,
};

export function PrismBottomTabs() {
  const pathname = usePathname();
  const { allows } = useMotionLevel();
  const animEnabled = allows(1);

  const activeKey =
    TABS.find((t) => pathname === t.href || pathname.startsWith(t.href + "/"))
      ?.key ?? "home";

  return (
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
                animEnabled={animEnabled}
              />
            ))}
          </div>
        </LayoutGroup>
      </div>
    </nav>
  );
}

function TabButton({
  tab,
  isActive,
  animEnabled,
}: {
  tab: TabItem;
  isActive: boolean;
  animEnabled: boolean;
}) {
  const Icon = tab.icon;
  const router = useRouter();

  /* アニメ無効時：素の Link で確実にナビゲーション */
  if (!animEnabled) {
    return (
      <Link
        href={tab.href}
        className={cn(
          "relative flex items-center justify-center rounded-2xl",
          isActive
            ? "h-11 gap-2 px-4"
            : "h-11 w-11 text-muted-foreground"
        )}
        aria-label={tab.label}
      >
        {isActive && (
          <div className="absolute inset-0 rounded-2xl dock-pill" />
        )}
        <div className="relative z-10 flex-shrink-0">
          <Icon
            className={cn(
              "h-5 w-5",
              isActive ? "text-primary" : ""
            )}
          />
        </div>
        {isActive && (
          <span className="relative z-10 text-xs font-semibold text-primary">
            {tab.label}
          </span>
        )}
      </Link>
    );
  }

  /* アニメ有効時：motion.div + router.push でナビゲーション
     Link の中に motion.div を入れると whileTap がタッチイベントを
     消費して Link のナビゲーションが発火しない問題を回避 */
  return (
    <motion.button
      type="button"
      onClick={() => router.push(tab.href)}
      className={cn(
        "relative flex items-center justify-center rounded-2xl",
        isActive
          ? "h-11 gap-2 px-4"
          : "h-11 w-11 text-muted-foreground hover:text-foreground"
      )}
      layout
      transition={MORPH_SPRING}
      whileTap={{ scale: 0.92, transition: { duration: 0.1 } }}
      aria-label={tab.label}
    >
      {/* TabMorphDock5 — pill background */}
      {isActive && (
        <motion.div
          layoutId="tab-pill"
          className="absolute inset-0 rounded-2xl dock-pill"
          transition={MORPH_SPRING}
          style={{ originX: 0.5, originY: 0.5 }}
        />
      )}

      {/* IconNudge */}
      <motion.div
        layout="position"
        transition={MORPH_SPRING}
        className="relative z-10 flex-shrink-0"
      >
        <Icon
          className={cn(
            "h-5 w-5 transition-colors duration-200",
            isActive ? "text-primary" : ""
          )}
        />
      </motion.div>

      {/* Label reveal */}
      <span
        className={cn(
          "relative z-10 overflow-hidden text-xs font-semibold text-primary whitespace-nowrap",
          "transition-all duration-300 ease-out",
          isActive
            ? "max-w-[60px] opacity-100"
            : "max-w-0 opacity-0"
        )}
      >
        {tab.label}
      </span>
    </motion.button>
  );
}
