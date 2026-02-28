"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/providers/supabase-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Copy, LogOut, Settings, Heart } from "lucide-react";
import { useState, useEffect } from "react";

export default function SettingsPage() {
  const router = useRouter();
  const { user, profile } = useUser();
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
      <div className="flex items-center gap-2">
        <Settings className="h-5 w-5 text-pink-400" />
        <h1 className="text-xl font-bold bg-gradient-to-r from-pink-500 to-purple-400 bg-clip-text text-transparent">設定</h1>
      </div>

      <Card className="border-pink-100/60 dark:border-pink-900/20">
        <CardHeader>
          <CardTitle className="text-base text-pink-600 dark:text-pink-400">プロフィール</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label className="text-muted-foreground">表示名</Label>
            <p className="text-sm font-medium">
              {profile?.display_name || "未設定"}
            </p>
          </div>
          <div>
            <Label className="text-muted-foreground">メールアドレス</Label>
            <p className="text-sm font-medium">{user?.email}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-pink-100/60 dark:border-pink-900/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base text-pink-600 dark:text-pink-400">
            <Heart className="h-4 w-4 fill-pink-300 text-pink-400" />
            ペア情報
          </CardTitle>
          <CardDescription>
            {partnerName
              ? `パートナー: ${partnerName}`
              : "パートナーが参加するのを待っています"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {inviteCode && (
            <div>
              <Label className="text-muted-foreground">招待コード</Label>
              <div className="mt-1 flex gap-2">
                <Input
                  value={inviteCode}
                  readOnly
                  className="font-mono text-sm tracking-wider"
                />
                <Button variant="outline" size="icon" className="border-pink-200 hover:bg-pink-50 dark:border-pink-800 dark:hover:bg-pink-950" onClick={handleCopyCode}>
                  <Copy className="h-4 w-4 text-pink-500" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Separator className="bg-pink-100 dark:bg-pink-900/30" />

      <Button
        variant="destructive"
        className="w-full"
        onClick={handleLogout}
      >
        <LogOut className="mr-2 h-4 w-4" />
        ログアウト
      </Button>
    </div>
  );
}
