"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/providers/supabase-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { Suspense } from "react";

function JoinPairForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshProfile } = useUser();
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // URLのクエリパラメータから招待コードを自動入力
  useEffect(() => {
    const codeParam = searchParams.get("code");
    if (codeParam) {
      setCode(codeParam);
    }
  }, [searchParams]);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const supabase = createClient();
    const { data, error } = await supabase.rpc("join_pair_by_code", {
      code: code.trim(),
    });

    if (error || data?.error) {
      const errorMessage =
        data?.error === "already_in_pair"
          ? "すでにペアに参加しています"
          : data?.error === "invalid_code"
            ? "招待コードが正しくありません"
            : data?.error === "pair_full"
              ? "このペアは既に2人で満員です"
              : error?.message || "参加に失敗しました";

      toast.error(errorMessage);
      setIsLoading(false);
      return;
    }

    await refreshProfile();
    toast.success("ペアに参加しました！");
    router.push("/home");
    router.refresh();
  };

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">ペアに参加</CardTitle>
        <CardDescription>
          パートナーから受け取った招待コードを入力してください
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleJoin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="code">招待コード</Label>
            <Input
              id="code"
              type="text"
              placeholder="招待コードを入力"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="font-mono text-center text-lg tracking-wider"
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "参加中..." : "ペアに参加する"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="justify-center">
        <p className="text-sm text-muted-foreground">
          ペアを新しく作る場合は{" "}
          <Link href="/create-pair" className="text-primary underline">
            ペアを作成
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}

export default function JoinPairPage() {
  return (
    <Suspense
      fallback={
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <p className="text-sm text-muted-foreground">読み込み中...</p>
          </CardContent>
        </Card>
      }
    >
      <JoinPairForm />
    </Suspense>
  );
}
