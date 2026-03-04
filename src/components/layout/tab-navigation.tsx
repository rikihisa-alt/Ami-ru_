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
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass-elevated lg:hidden">
      <div className="flex h-16 items-center justify-around px-2">
        {tabs.map((tab) => {
          const isActive =
            pathname === tab.href || pathname.startsWith(tab.href + "/");
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "relative flex flex-col items-center gap-0.5 rounded-xl px-3 py-1.5 text-[11px] font-medium",
                "transition-all duration-200",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <tab.icon className="h-5 w-5" />
              <span>{tab.label}</span>
              {isActive && (
                <span className="absolute -bottom-0.5 h-1 w-1 rounded-full bg-primary" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
