"use client";

import Link from "next/link";
import { Settings } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/95 backdrop-blur-lg lg:hidden">
      <div className="flex h-11 items-center justify-between px-4">
        <Link
          href="/home"
          className="text-[17px] font-bold tracking-tight text-foreground"
        >
          Ami-ru
        </Link>
        <Link
          href="/settings"
          className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors active:bg-muted"
        >
          <Settings className="h-[18px] w-[18px]" />
        </Link>
      </div>
    </header>
  );
}
