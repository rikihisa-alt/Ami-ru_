"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
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
import { Copy, Check } from "lucide-react";

export default function CreatePairPage() {
  const router = useRouter();
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

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
    setIsLoading(false);
  };

  const handleCopy = async () => {
    if (!inviteCode) return;
    await navigator.clipboard.writeText(inviteCode);
    setCopied(true);
    toast.success("コードをコピーしました");
    setTimeout(() => setCopied(false), 2000);
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
          <div className="space-y-4">
            <p className="text-center text-sm text-muted-foreground">
              以下の招待コードをパートナーに共有してください
            </p>
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
