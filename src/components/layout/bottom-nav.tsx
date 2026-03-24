"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Package,
  Calendar,
  Wallet,
  LayoutGrid,
  BookOpen,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TabItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

const TABS: TabItem[] = [
  { href: "/home", label: "ホーム", icon: Home },
  { href: "/pantry", label: "ストック", icon: Package },
  { href: "/calendar", label: "予定", icon: Calendar },
  { href: "/money", label: "お金", icon: Wallet },
  { href: "/diary", label: "日記", icon: BookOpen },
  { href: "/board", label: "ボード", icon: LayoutGrid },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 lg:hidden motion-safe:animate-dock-in"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="border-t border-border/60 bg-background/95 backdrop-blur-lg">
        <div className="mx-auto flex h-[50px] max-w-lg items-center justify-around">
          {TABS.map((tab) => {
            const isActive =
              pathname === tab.href || pathname.startsWith(tab.href + "/");
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  "flex flex-col items-center justify-center gap-0.5 px-2 py-1",
                  "transition-colors duration-150",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground active:text-foreground"
                )}
              >
                <tab.icon
                  className={cn("h-[20px] w-[20px]", isActive && "stroke-[2.2]")}
                />
                <span className="text-[10px] font-medium leading-tight">
                  {tab.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
