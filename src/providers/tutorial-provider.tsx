"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";

export type TutorialStep = {
  id: string;
  title: string;
  description: string;
  icon: string;
  route: string;
};

export const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: "welcome",
    title: "Ami-ruへようこそ！",
    description:
      "ふたりの暮らしをひとつにまとめるアプリです。\n冷蔵庫・予定・家計・日記・掲示板を\nパートナーと一緒に管理できます。",
    icon: "👋",
    route: "/home",
  },
  {
    id: "home",
    title: "ホーム画面",
    description:
      "今日の予定、やること、期限の近い食材、\n今月の精算がひと目でわかるダッシュボードです。",
    icon: "🏠",
    route: "/home",
  },
  {
    id: "pantry",
    title: "冷蔵庫",
    description:
      "冷蔵庫の中身を管理できます。\n食材を登録して期限を設定すると、\n期限が近い食材をお知らせします。",
    icon: "🧊",
    route: "/pantry",
  },
  {
    id: "calendar",
    title: "予定",
    description:
      "ふたりの予定を共有カレンダーで管理できます。\nデート、イベント、通院など\nなんでも登録できます。",
    icon: "📅",
    route: "/calendar",
  },
  {
    id: "money",
    title: "お金",
    description:
      "ふたりの家計を管理できます。\n誰が何にいくら払ったかを記録して、\n月末にまとめて精算できます。",
    icon: "💰",
    route: "/money",
  },
  {
    id: "diary",
    title: "日記",
    description:
      "日々の出来事を日記として残せます。\n気分や天気も記録して、\nふたりの思い出を振り返りましょう。",
    icon: "📖",
    route: "/diary",
  },
  {
    id: "board",
    title: "ボード",
    description:
      "メモ、買い物リスト、やること、\n行きたい場所をまとめて管理できます。\nふたりの掲示板として使いましょう。",
    icon: "📌",
    route: "/board",
  },
  {
    id: "complete",
    title: "準備完了！",
    description:
      "チュートリアルは以上です。\nパートナーを招待して、\nふたりでAmi-ruを使い始めましょう！",
    icon: "🎉",
    route: "/home",
  },
];

type TutorialContextType = {
  isActive: boolean;
  currentStep: number;
  totalSteps: number;
  step: TutorialStep | null;
  showPrompt: boolean;
  startTutorial: () => void;
  nextStep: () => void;
  prevStep: () => void;
  skipTutorial: () => void;
  dismissPrompt: () => void;
  isCompleted: boolean;
};

const TutorialContext = createContext<TutorialContextType | undefined>(
  undefined
);

const STORAGE_KEY = "ami-ru-tutorial";
const COMPLETED_KEY = "ami-ru-tutorial-completed";

export function TutorialProvider({ children }: { children: ReactNode }) {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isCompleted, setIsCompleted] = useState(true);

  // 初回ロード時にチュートリアル状態を確認
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    const completed = localStorage.getItem(COMPLETED_KEY);

    if (stored === "active") {
      // 設定画面から再開された
      setIsActive(true);
      setCurrentStep(0);
      localStorage.removeItem(STORAGE_KEY);
    } else if (!completed) {
      // 初めてのユーザー → プロンプトを表示
      setShowPrompt(true);
      setIsCompleted(false);
    }
  }, []);

  const startTutorial = useCallback(() => {
    setIsActive(true);
    setCurrentStep(0);
    setShowPrompt(false);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const nextStep = useCallback(() => {
    if (currentStep < TUTORIAL_STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      // 完了
      setIsActive(false);
      setIsCompleted(true);
      localStorage.setItem(COMPLETED_KEY, "true");
    }
  }, [currentStep]);

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  }, [currentStep]);

  const skipTutorial = useCallback(() => {
    setIsActive(false);
    setShowPrompt(false);
    setIsCompleted(true);
    localStorage.setItem(COMPLETED_KEY, "true");
  }, []);

  const dismissPrompt = useCallback(() => {
    setShowPrompt(false);
    localStorage.setItem(COMPLETED_KEY, "true");
  }, []);

  const step = isActive ? TUTORIAL_STEPS[currentStep] ?? null : null;

  return (
    <TutorialContext.Provider
      value={{
        isActive,
        currentStep,
        totalSteps: TUTORIAL_STEPS.length,
        step,
        showPrompt,
        startTutorial,
        nextStep,
        prevStep,
        skipTutorial,
        dismissPrompt,
        isCompleted,
      }}
    >
      {children}
    </TutorialContext.Provider>
  );
}

export function useTutorial() {
  const context = useContext(TutorialContext);
  if (!context) {
    throw new Error("useTutorial must be used within a TutorialProvider");
  }
  return context;
}
