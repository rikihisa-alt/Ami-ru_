"use client";

import { useState } from "react";
import { useTodayThanks, useAddThanksLog } from "@/lib/hooks/use-thanks";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Heart } from "lucide-react";
import { toast } from "sonner";

const QUICK_THANKS = [
  "ごはん作ってくれてありがとう",
  "掃除してくれてありがとう",
  "買い物ありがとう",
  "いつもありがとう",
];

export function ThanksButton() {
  const { data: todayThanks } = useTodayThanks();
  const addThanks = useAddThanksLog();
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");

  const handleQuickThanks = async (msg: string) => {
    try {
      await addThanks.mutateAsync({ message: msg });
      setIsOpen(false);
      setMessage("");
      toast.success("ありがとうを送ったよ 💕");
    } catch {
      // silent in demo mode
    }
  };

  const handleCustomThanks = async () => {
    try {
      await addThanks.mutateAsync({
        message: message.trim() || undefined,
      });
      setIsOpen(false);
      setMessage("");
      toast.success("ありがとうを送ったよ 💕");
    } catch {
      // silent in demo mode
    }
  };

  const thanksCount = todayThanks?.length ?? 0;

  // 展開モード：クイック選択 + 自由入力
  if (isOpen) {
    return (
      <Card className="space-y-3 p-4">
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            ありがとうを伝えよう
          </p>
          <button
            onClick={() => setIsOpen(false)}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            ✕
          </button>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {QUICK_THANKS.map((msg) => (
            <button
              key={msg}
              onClick={() => handleQuickThanks(msg)}
              disabled={addThanks.isPending}
              className="rounded-full border border-border bg-background px-3 py-1.5 text-xs transition-colors hover:border-rose-300 hover:bg-rose-50 active:scale-95 dark:hover:bg-rose-950/20"
            >
              {msg}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="自由にメッセージ"
            className="text-sm"
            maxLength={100}
          />
          <Button
            size="sm"
            onClick={handleCustomThanks}
            disabled={addThanks.isPending}
          >
            送る
          </Button>
        </div>
      </Card>
    );
  }

  // 通常モード：ボタン + 今日のカウント
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground">
            今日のありがとう
          </p>
          {thanksCount > 0 ? (
            <p className="mt-0.5 text-sm">
              <span className="font-medium text-rose-400">{thanksCount}回</span>
              <span className="ml-1 text-muted-foreground">伝えたよ</span>
            </p>
          ) : (
            <p className="mt-0.5 text-xs text-muted-foreground">
              まだ送ってないよ
            </p>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsOpen(true)}
          className="gap-1.5 border-rose-200 text-rose-400 hover:bg-rose-50 hover:text-rose-500 dark:border-rose-800 dark:hover:bg-rose-950/20"
        >
          <Heart className="h-3.5 w-3.5" />
          ありがとう
        </Button>
      </div>
    </Card>
  );
}
