"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";

/**
 * Motion Level
 * 0 = OFF    — すべてのアニメ無効
 * 1 = NORMAL — 標準アニメのみ
 * 2 = RICH   — 背景ドリフト含む全演出
 */
export type MotionLevel = 0 | 1 | 2;

const STORAGE_KEY = "ami-ru-motion-level";

interface MotionCtx {
  level: MotionLevel;
  setLevel: (l: MotionLevel) => void;
  /** 指定レベル以上のとき true */
  allows: (minLevel: MotionLevel) => boolean;
}

const MotionContext = createContext<MotionCtx>({
  level: 1,
  setLevel: () => {},
  allows: () => true,
});

export const useMotionLevel = () => useContext(MotionContext);

export { MotionContext };

export function MotionLevelProvider({ children }: { children: ReactNode }) {
  const [level, setLevelState] = useState<MotionLevel>(1);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved !== null) {
      const parsed = parseInt(saved, 10);
      if (parsed >= 0 && parsed <= 2) {
        setLevelState(parsed as MotionLevel);
      }
    }
  }, []);

  const setLevel = useCallback((l: MotionLevel) => {
    setLevelState(l);
    localStorage.setItem(STORAGE_KEY, String(l));
    // Set data attribute for CSS-based motion control
    document.documentElement.setAttribute("data-motion", String(l));
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-motion", String(level));
  }, [level]);

  const allows = useCallback(
    (minLevel: MotionLevel) => level >= minLevel,
    [level]
  );

  return (
    <MotionContext.Provider value={{ level, setLevel, allows }}>
      {children}
    </MotionContext.Provider>
  );
}
