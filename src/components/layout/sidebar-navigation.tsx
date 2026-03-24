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
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/home", label: "ホーム", icon: Home },
  { href: "/pantry", label: "ストック", icon: Package },
  { href: "/calendar", label: "予定", icon: Calendar },
  { href: "/money", label: "お金", icon: Wallet },
  { href: "/diary", label: "日記", icon: BookOpen },
  { href: "/board", label: "ボード", icon: LayoutGrid },
] as const;

export function SidebarNavigation() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex lg:w-[200px] lg:shrink-0 lg:flex-col lg:border-r lg:border-border">
      <div className="flex h-12 items-center px-5">
        <span className="text-[15px] font-bold tracking-tight text-foreground">
          Ami-ru
        </span>
      </div>

      <nav className="flex flex-1 flex-col gap-0.5 px-3 py-2">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium",
                "transition-colors duration-150",
                isActive
                  ? "bg-primary/8 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="h-[16px] w-[16px]" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border px-3 py-2">
        <Link
          href="/settings"
          className={cn(
            "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium",
            "transition-colors duration-150",
            pathname === "/settings"
              ? "bg-primary/8 text-primary"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          <Settings className="h-[16px] w-[16px]" />
          設定
        </Link>
      </div>
    </aside>
  );
}
