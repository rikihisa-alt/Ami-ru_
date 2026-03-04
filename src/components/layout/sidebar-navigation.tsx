"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Refrigerator,
  Calendar,
  Wallet,
  LayoutGrid,
  Settings,
  Heart,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/home", label: "ホーム", icon: Home },
  { href: "/pantry", label: "冷蔵庫", icon: Refrigerator },
  { href: "/calendar", label: "予定", icon: Calendar },
  { href: "/money", label: "お金", icon: Wallet },
  { href: "/board", label: "ボード", icon: LayoutGrid },
] as const;

export function SidebarNavigation() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex lg:w-[220px] lg:shrink-0 lg:flex-col glass lg:border-r-0 lg:rounded-none">
      <div className="flex h-14 items-center gap-2 px-5">
        <Heart className="h-5 w-5 text-primary/70" />
        <span className="text-lg font-bold tracking-tight text-foreground">
          Ami-ru
        </span>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3 py-4">
        {navItems.map((item, i) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium",
                "transition-all duration-200",
                "motion-safe:animate-slide-reveal",
                isActive
                  ? "glass-primary text-primary"
                  : "text-muted-foreground hover:bg-[var(--glass-bg)] hover:text-foreground"
              )}
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <item.icon className="h-[18px] w-[18px]" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-[var(--glass-border)] px-3 py-3">
        <Link
          href="/settings"
          className={cn(
            "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium",
            "transition-all duration-200",
            pathname === "/settings"
              ? "glass-primary text-primary"
              : "text-muted-foreground hover:bg-[var(--glass-bg)] hover:text-foreground"
          )}
        >
          <Settings className="h-[18px] w-[18px]" />
          設定
        </Link>
      </div>
    </aside>
  );
}
