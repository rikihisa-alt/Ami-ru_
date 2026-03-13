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
import {
  Copy,
  LogOut,
  Settings,
  Heart,
  Sun,
  Moon,
  Check,
  Palette,
  Zap,
  MessageCircle,
  Mail,
  Link as LinkIcon,
  Share2,
  GraduationCap,
} from "lucide-react";
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
  const [codeCopied, setCodeCopied] = useState(false);

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

  const getJoinUrl = () => {
    if (!inviteCode) return "";
    const base = typeof window !== "undefined" ? window.location.origin : "";
    return `${base}/join-pair?code=${inviteCode}`;
  };

  const handleCopyCode = async () => {
    if (!inviteCode) return;
    await navigator.clipboard.writeText(inviteCode);
    setCodeCopied(true);
    toast.success("招待コードをコピーしました");
    setTimeout(() => setCodeCopied(false), 2000);
  };

  const handleCopyLink = async () => {
    const url = getJoinUrl();
    await navigator.clipboard.writeText(url);
    toast.success("招待リンクをコピーしました");
  };

  const handleShareLINE = () => {
    const url = getJoinUrl();
    const text = `Ami-ruで一緒に生活を管理しよう！\n招待コード: ${inviteCode}\n${url}`;
    window.open(
      `https://line.me/R/msg/text/?${encodeURIComponent(text)}`,
      "_blank"
    );
  };

  const handleShareEmail = () => {
    const url = getJoinUrl();
    const subject = "Ami-ruに招待されました";
    const body = `Ami-ruで一緒に生活を管理しましょう！\n\n招待コード: ${inviteCode}\n\n以下のリンクから参加できます:\n${url}`;
    window.open(
      `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
      "_blank"
    );
  };

  const handleNativeShare = async () => {
    const url = getJoinUrl();
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Ami-ru 招待",
          text: `Ami-ruで一緒に生活を管理しよう！ 招待コード: ${inviteCode}`,
          url,
        });
      } catch {
        // キャンセル
      }
    } else {
      handleCopyLink();
    }
  };

  const handleStartTutorial = () => {
    localStorage.setItem("ami-ru-tutorial", "active");
    router.push("/home");
    // ページ遷移後にチュートリアルが起動する
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

      {/* ── ペア情報 + 招待共有 ── */}
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
          <div className="space-y-4">
            {/* 招待コード表示 */}
            <div>
              <Label className="text-muted-foreground">招待コード</Label>
              <div className="mt-1 flex gap-2">
                <Input
                  value={inviteCode}
                  readOnly
                  className="rounded-xl font-mono text-sm tracking-wider"
                />
                <PrismButton variant="secondary" size="icon" onClick={handleCopyCode}>
                  {codeCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </PrismButton>
              </div>
            </div>

            {/* パートナーがまだいない場合のみ共有ボタンを表示 */}
            {!partnerName && (
              <div className="space-y-2">
                <Label className="text-muted-foreground">パートナーを招待する</Label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={handleShareLINE}
                    className="flex h-11 items-center justify-center gap-2 rounded-xl bg-secondary text-sm font-medium text-secondary-foreground transition-colors hover:bg-secondary/80"
                  >
                    <MessageCircle className="h-4 w-4 text-green-500" />
                    LINEで送る
                  </button>
                  <button
                    type="button"
                    onClick={handleShareEmail}
                    className="flex h-11 items-center justify-center gap-2 rounded-xl bg-secondary text-sm font-medium text-secondary-foreground transition-colors hover:bg-secondary/80"
                  >
                    <Mail className="h-4 w-4 text-blue-500" />
                    メールで送る
                  </button>
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="flex h-11 items-center justify-center gap-2 rounded-xl bg-secondary text-sm font-medium text-secondary-foreground transition-colors hover:bg-secondary/80"
                  >
                    <LinkIcon className="h-4 w-4 text-muted-foreground" />
                    リンクをコピー
                  </button>
                  <button
                    type="button"
                    onClick={handleNativeShare}
                    className="flex h-11 items-center justify-center gap-2 rounded-xl bg-secondary text-sm font-medium text-secondary-foreground transition-colors hover:bg-secondary/80"
                  >
                    <Share2 className="h-4 w-4 text-muted-foreground" />
                    その他の共有
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </PrismCard>

      {/* ── チュートリアル ── */}
      <PrismCard variant="flat" animationIndex={4}>
        <div className="flex items-center gap-2.5 pb-3">
          <GraduationCap className="h-4 w-4 text-primary" />
          <p className="font-semibold">チュートリアル</p>
        </div>
        <p className="pb-3 text-xs text-muted-foreground">
          Ami-ruの使い方をもう一度確認できます
        </p>
        <PrismButton
          variant="secondary"
          className="w-full"
          onClick={handleStartTutorial}
        >
          <GraduationCap className="mr-2 h-4 w-4" />
          チュートリアルを始める
        </PrismButton>
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
