"use client";

import Link from "next/link";
import { Settings, Heart } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-40 glass lg:hidden">
      <div className="flex h-14 items-center justify-between px-4">
        <Link
          href="/home"
          className="flex items-center gap-1.5 text-lg font-bold tracking-tight text-foreground"
        >
          <Heart className="h-5 w-5 text-primary/70" />
          <span>Ami-ru</span>
        </Link>
        <Link
          href="/settings"
          className="flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground transition-all duration-200 hover:bg-[var(--glass-bg)] hover:text-foreground active:scale-[0.97]"
        >
          <Settings className="h-5 w-5" />
        </Link>
      </div>
    </header>
  );
}
