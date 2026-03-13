"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useTutorial, TUTORIAL_STEPS } from "@/providers/tutorial-provider";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

/** 初回ログイン時の「チュートリアルを始めますか？」ダイアログ */
export function TutorialPrompt() {
  const { showPrompt, startTutorial, dismissPrompt } = useTutorial();

  if (!showPrompt) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-xl"
        >
          <div className="mb-4 text-center text-4xl">👋</div>
          <h2 className="mb-2 text-center text-lg font-bold text-foreground">
            Ami-ruへようこそ！
          </h2>
          <p className="mb-6 text-center text-sm leading-relaxed text-muted-foreground">
            アプリの使い方を簡単にご紹介します。
            <br />
            チュートリアルを始めますか？
          </p>
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={dismissPrompt}
            >
              スキップ
            </Button>
            <Button className="flex-1" onClick={startTutorial}>
              始める
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/** チュートリアルのステップ表示オーバーレイ */
export function TutorialStepOverlay() {
  const router = useRouter();
  const { isActive, step, currentStep, totalSteps, nextStep, prevStep, skipTutorial } =
    useTutorial();

  // ステップが変わったらルーティング
  useEffect(() => {
    if (isActive && step) {
      router.push(step.route);
    }
  }, [isActive, step, router]);

  if (!isActive || !step) return null;

  const isFirst = currentStep === 0;
  const isLast = currentStep === totalSteps - 1;
  const progress = ((currentStep + 1) / totalSteps) * 100;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={step.id}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        className="fixed inset-0 z-[100] flex items-end justify-center pb-28 lg:items-center lg:pb-0"
      >
        {/* 背景オーバーレイ（半透明） */}
        <div
          className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"
          onClick={skipTutorial}
        />

        {/* ステップカード */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className="relative w-full max-w-sm rounded-2xl border border-border bg-card p-5 shadow-2xl mx-4"
        >
          {/* 閉じるボタン */}
          <button
            type="button"
            onClick={skipTutorial}
            className="absolute right-3 top-3 rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>

          {/* プログレスバー */}
          <div className="mb-4 h-1 overflow-hidden rounded-full bg-secondary">
            <motion.div
              className="h-full rounded-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            />
          </div>

          {/* アイコン */}
          <div className="mb-3 text-center text-4xl">{step.icon}</div>

          {/* テキスト */}
          <h3 className="mb-2 text-center text-base font-bold text-foreground">
            {step.title}
          </h3>
          <p className="mb-5 whitespace-pre-line text-center text-sm leading-relaxed text-muted-foreground">
            {step.description}
          </p>

          {/* ステップカウンター */}
          <p className="mb-4 text-center text-xs text-muted-foreground">
            {currentStep + 1} / {totalSteps}
          </p>

          {/* ナビゲーションボタン */}
          <div className="flex gap-3">
            {!isFirst ? (
              <Button variant="outline" className="flex-1 gap-1" onClick={prevStep}>
                <ChevronLeft className="h-4 w-4" />
                戻る
              </Button>
            ) : (
              <Button variant="outline" className="flex-1" onClick={skipTutorial}>
                スキップ
              </Button>
            )}
            <Button className="flex-1 gap-1" onClick={nextStep}>
              {isLast ? (
                "完了"
              ) : (
                <>
                  次へ
                  <ChevronRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
