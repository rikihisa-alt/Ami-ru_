"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Refrigerator, Calendar, Wallet, LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/home", label: "ホーム", icon: Home },
  { href: "/pantry", label: "冷蔵庫", icon: Refrigerator },
  { href: "/calendar", label: "予定", icon: Calendar },
  { href: "/money", label: "お金", icon: Wallet },
  { href: "/board", label: "ボード", icon: LayoutGrid },
] as const;

export function TabNavigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-pink-100 bg-white/95 backdrop-blur dark:border-pink-900/30 dark:bg-background/95">
      <div className="mx-auto flex h-16 max-w-md items-center justify-around px-2">
        {tabs.map((tab) => {
          const isActive =
            pathname === tab.href || pathname.startsWith(tab.href + "/");
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "flex flex-col items-center gap-0.5 rounded-xl px-3 py-1.5 text-[11px] font-medium transition-all",
                isActive
                  ? "bg-pink-50 text-pink-500 dark:bg-pink-950/50 dark:text-pink-400"
                  : "text-gray-400 hover:text-pink-400 dark:text-gray-500"
              )}
            >
              <tab.icon
                className={cn(
                  "h-5 w-5 transition-transform",
                  isActive && "scale-110"
                )}
              />
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
