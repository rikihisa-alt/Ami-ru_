"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/providers/supabase-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { Copy, Check, Share2, Mail, MessageCircle, Link as LinkIcon } from "lucide-react";

export default function CreatePairPage() {
  const router = useRouter();
  const { refreshProfile } = useUser();
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const getJoinUrl = () => {
    if (!inviteCode) return "";
    const base = typeof window !== "undefined" ? window.location.origin : "";
    return `${base}/join-pair?code=${inviteCode}`;
  };

  const handleCreatePair = async () => {
    setIsLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase.rpc("create_pair");

    if (error || data?.error) {
      toast.error("ペアの作成に失敗しました", {
        description: error?.message || data?.error,
      });
      setIsLoading(false);
      return;
    }

    setInviteCode(data.invite_code);
    await refreshProfile();
    setIsLoading(false);
  };

  const handleCopy = async () => {
    if (!inviteCode) return;
    await navigator.clipboard.writeText(inviteCode);
    setCopied(true);
    toast.success("コードをコピーしました");
    setTimeout(() => setCopied(false), 2000);
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
        // ユーザーがキャンセルした場合は何もしない
      }
    } else {
      handleCopyLink();
    }
  };

  const handleGoHome = () => {
    router.push("/home");
    router.refresh();
  };

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">ペアを作成</CardTitle>
        <CardDescription>
          パートナーと一緒に使うためのペアを作りましょう
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!inviteCode ? (
          <Button
            onClick={handleCreatePair}
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? "作成中..." : "ペアを作成する"}
          </Button>
        ) : (
          <div className="space-y-5">
            <p className="text-center text-sm text-muted-foreground">
              パートナーに招待を送りましょう
            </p>

            {/* 招待コード表示 */}
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground">招待コード</p>
              <div className="flex gap-2">
                <Input
                  value={inviteCode}
                  readOnly
                  className="font-mono text-center text-lg tracking-wider"
                />
                <Button variant="outline" size="icon" onClick={handleCopy}>
                  {copied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* 共有ボタン群 */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">招待を送る</p>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  className="h-12 gap-2"
                  onClick={handleShareLINE}
                >
                  <MessageCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">LINEで送る</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-12 gap-2"
                  onClick={handleShareEmail}
                >
                  <Mail className="h-4 w-4 text-blue-500" />
                  <span className="text-sm">メールで送る</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-12 gap-2"
                  onClick={handleCopyLink}
                >
                  <LinkIcon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">リンクをコピー</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-12 gap-2"
                  onClick={handleNativeShare}
                >
                  <Share2 className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">その他の共有</span>
                </Button>
              </div>
            </div>

            <Button onClick={handleGoHome} className="w-full">
              ホームへ進む
            </Button>
          </div>
        )}
      </CardContent>
      <CardFooter className="justify-center">
        <p className="text-sm text-muted-foreground">
          招待コードをもらった方は{" "}
          <Link href="/join-pair" className="text-primary underline">
            ペアに参加
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
