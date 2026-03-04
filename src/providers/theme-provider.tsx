"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

/* ── テーマカラー定義 ── */
export const THEME_COLORS = [
  { key: "coral", label: "コーラル", swatch: "#C8796F" },
  { key: "sakura", label: "さくら", swatch: "#D48BA6" },
  { key: "lavender", label: "ラベンダー", swatch: "#9B8BC8" },
  { key: "sky", label: "スカイ", swatch: "#6BA8C8" },
  { key: "mint", label: "ミント", swatch: "#6BBD9E" },
  { key: "lemon", label: "レモン", swatch: "#C8B05E" },
] as const;

export type ThemeColorKey = (typeof THEME_COLORS)[number]["key"];

const STORAGE_KEY = "ami-ru-color";

interface ColorCtx {
  color: ThemeColorKey;
  setColor: (c: ThemeColorKey) => void;
}

const ColorContext = createContext<ColorCtx>({
  color: "coral",
  setColor: () => {},
});

export const useThemeColor = () => useContext(ColorContext);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [color, setColorState] = useState<ThemeColorKey>("coral");

  /* 初回マウントで localStorage から復元 */
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as ThemeColorKey | null;
    if (saved && THEME_COLORS.some((c) => c.key === saved)) {
      setColorState(saved);
      document.documentElement.setAttribute("data-color", saved);
    }
  }, []);

  const setColor = useCallback((c: ThemeColorKey) => {
    setColorState(c);
    localStorage.setItem(STORAGE_KEY, c);
    document.documentElement.setAttribute("data-color", c);
  }, []);

  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      disableTransitionOnChange
    >
      <ColorContext.Provider value={{ color, setColor }}>
        {children}
      </ColorContext.Provider>
    </NextThemesProvider>
  );
}
