"use client";

import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/providers/supabase-provider";
import { useThemeColor, THEME_COLORS, type ThemeColorKey } from "@/providers/theme-provider";
import { useMotionLevel, type MotionLevel } from "@/lib/hooks/use-motion-level";
import { PrismButton } from "@/components/ui/prism-button";
import { PrismCard } from "@/components/ui/prism-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Copy, LogOut, Settings, Heart, Sun, Moon, Check, Palette, Zap } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

const MOTION_OPTIONS: { value: MotionLevel; label: string; desc: string }[] = [
  { value: 0, label: "OFF", desc: "アニメーションなし" },
  { value: 1, label: "NORMAL", desc: "標準アニメーション" },
  { value: 2, label: "RICH", desc: "全演出 + 背景ドリフト" },
];

export default function SettingsPage() {
  const router = useRouter();
  const { user, profile } = useUser();
  const { theme, setTheme } = useTheme();
  const { color, setColor } = useThemeColor();
  const { level: motionLevel, setLevel: setMotionLevel } = useMotionLevel();
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [partnerName, setPartnerName] = useState<string | null>(null);

  useEffect(() => {
    const fetchPairInfo = async () => {
      if (!profile?.pair_id) return;
      const supabase = createClient();

      const { data: pair } = await supabase
        .from("pairs")
        .select("invite_code")
        .eq("id", profile.pair_id)
        .single();
      setInviteCode(pair?.invite_code ?? null);

      const { data: partner } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("pair_id", profile.pair_id)
        .neq("id", user?.id ?? "")
        .single();
      setPartnerName(partner?.display_name ?? null);
    };

    fetchPairInfo();
  }, [profile?.pair_id, user?.id]);

  const handleCopyCode = async () => {
    if (!inviteCode) return;
    await navigator.clipboard.writeText(inviteCode);
    toast.success("招待コードをコピーしました");
  };

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2.5 motion-safe:animate-prism-fade-up">
        <Settings className="h-5 w-5 text-muted-foreground" />
        <h1 className="text-xl font-bold tracking-tight text-foreground">設定</h1>
      </div>

      {/* ── テーマ設定 ── */}
      <PrismCard variant="flat" animationIndex={0}>
        <div className="flex items-center gap-2.5 pb-4">
          <Palette className="h-4 w-4 text-primary" />
          <p className="font-semibold">テーマ</p>
        </div>
        <div className="space-y-5">
          {/* ダーク / ライト切替 */}
          <div className="space-y-2">
            <Label className="text-muted-foreground">外観モード</Label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setTheme("light")}
                className={cn(
                  "flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium transition-all",
                  theme === "light"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80",
                )}
              >
                <Sun className="h-4 w-4" /> ライト
              </button>
              <button
                type="button"
                onClick={() => setTheme("dark")}
                className={cn(
                  "flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium transition-all",
                  theme === "dark"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80",
                )}
              >
                <Moon className="h-4 w-4" /> ダーク
              </button>
            </div>
          </div>

          {/* カラーテーマ選択 */}
          <div className="space-y-2">
            <Label className="text-muted-foreground">テーマカラー</Label>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
              {THEME_COLORS.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setColor(t.key as ThemeColorKey)}
                  className={cn(
                    "flex flex-col items-center gap-1.5 rounded-xl px-2 py-3 text-xs font-medium transition-all",
                    color === t.key
                      ? "bg-primary/10 ring-2 ring-primary"
                      : "bg-secondary hover:bg-secondary/80",
                  )}
                >
                  <span
                    className="flex h-8 w-8 items-center justify-center rounded-full ring-1 ring-black/10"
                    style={{ backgroundColor: t.swatch }}
                  >
                    {color === t.key && (
                      <Check className="h-4 w-4 text-white drop-shadow-sm" />
                    )}
                  </span>
                  <span>{t.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </PrismCard>

      {/* ── モーション設定 ── */}
      <PrismCard variant="flat" animationIndex={1}>
        <div className="flex items-center gap-2.5 pb-4">
          <Zap className="h-4 w-4 text-amber-400" />
          <p className="font-semibold">モーション</p>
        </div>
        <div className="space-y-2">
          <Label className="text-muted-foreground">アニメーションレベル</Label>
          <div className="flex gap-2">
            {MOTION_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setMotionLevel(opt.value)}
                className={cn(
                  "flex flex-1 flex-col items-center gap-1 rounded-xl px-3 py-3 text-xs font-medium transition-all",
                  motionLevel === opt.value
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80",
                )}
              >
                <span className="text-sm font-bold">{opt.label}</span>
                <span className={cn(
                  "text-[10px]",
                  motionLevel === opt.value ? "text-primary-foreground/80" : "text-muted-foreground"
                )}>
                  {opt.desc}
                </span>
              </button>
            ))}
          </div>
        </div>
      </PrismCard>

      {/* ── プロフィール ── */}
      <PrismCard variant="flat" animationIndex={2}>
        <p className="pb-3 font-semibold">プロフィール</p>
        <div className="space-y-3">
          <div>
            <Label className="text-muted-foreground">表示名</Label>
            <p className="text-sm font-medium">{profile?.display_name || "未設定"}</p>
          </div>
          <div>
            <Label className="text-muted-foreground">メールアドレス</Label>
            <p className="text-sm font-medium">{user?.email}</p>
          </div>
        </div>
      </PrismCard>

      {/* ── ペア情報 ── */}
      <PrismCard variant="flat" animationIndex={3}>
        <div className="flex items-center gap-2.5 pb-1">
          <Heart className="h-4 w-4 text-primary" />
          <p className="font-semibold">ペア情報</p>
        </div>
        <p className="pb-3 text-xs text-muted-foreground">
          {partnerName
            ? `パートナー: ${partnerName}`
            : "パートナーが参加するのを待っています"}
        </p>
        {inviteCode && (
          <div>
            <Label className="text-muted-foreground">招待コード</Label>
            <div className="mt-1 flex gap-2">
              <Input
                value={inviteCode}
                readOnly
                className="rounded-xl font-mono text-sm tracking-wider"
              />
              <PrismButton variant="secondary" size="icon" onClick={handleCopyCode}>
                <Copy className="h-4 w-4" />
              </PrismButton>
            </div>
          </div>
        )}
      </PrismCard>

      <Separator />

      <PrismButton
        variant="danger"
        className="w-full"
        onClick={handleLogout}
      >
        <LogOut className="mr-2 h-4 w-4" />
        ログアウト
      </PrismButton>
    </div>
  );
}
