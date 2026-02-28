"use client";

import Link from "next/link";
import { Settings, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-pink-100 bg-white/90 backdrop-blur dark:border-pink-900/30 dark:bg-background/90">
      <div className="mx-auto flex h-14 max-w-md items-center justify-between px-4">
        <Link
          href="/home"
          className="flex items-center gap-1.5 text-lg font-bold tracking-tight text-primary"
        >
          <Heart className="h-5 w-5 fill-pink-300 text-pink-400" />
          <span className="bg-gradient-to-r from-pink-500 to-purple-400 bg-clip-text text-transparent">
            Ami-ru
          </span>
        </Link>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full text-muted-foreground hover:bg-pink-50 hover:text-pink-500 dark:hover:bg-pink-950"
          asChild
        >
          <Link href="/settings">
            <Settings className="h-5 w-5" />
          </Link>
        </Button>
      </div>
    </header>
  );
}
