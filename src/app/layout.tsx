import type { Metadata, Viewport } from "next";
import { ThemeProvider } from "@/providers/theme-provider";
import { QueryProvider } from "@/providers/query-provider";
import { SupabaseProvider } from "@/providers/supabase-provider";
import { MotionLevelProvider } from "@/lib/hooks/use-motion-level";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ami-ru | ふたりの暮らしをもっとスムーズに",
  description:
    "同棲カップル向けの共有生活管理アプリ。冷蔵庫管理、予定共有、家計簿、掲示板、ToDoをまとめて管理。",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Ami-ru",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FAFAF8" },
    { media: "(prefers-color-scheme: dark)", color: "#111111" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider>
          <MotionLevelProvider>
            <QueryProvider>
              <SupabaseProvider>
                {children}
                <Toaster />
              </SupabaseProvider>
            </QueryProvider>
          </MotionLevelProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
