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
import { Copy, LogOut } from "lucide-react";
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

      // Get invite code
      const { data: pair } = await supabase
        .from("pairs")
        .select("invite_code")
        .eq("id", profile.pair_id)
        .single();
      setInviteCode(pair?.invite_code ?? null);

      // Get partner name
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
      <h1 className="text-xl font-bold">設定</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">プロフィール</CardTitle>
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

      <Card>
        <CardHeader>
          <CardTitle className="text-base">ペア情報</CardTitle>
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
                <Button variant="outline" size="icon" onClick={handleCopyCode}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Separator />

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
