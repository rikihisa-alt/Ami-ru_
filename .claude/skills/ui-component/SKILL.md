---
name: ui-component
description: Ami-ruのUIコンポーネントを作成・改善するときに使う。「このコンポーネントをApple風にして」「ナビゲーションを作って」「モーションを追加して」「トーストを実装して」と言ったときに使う。
---

# UI Component — Ami-ru

## コンポーネント設計の原則
- Apple系UI思想を徹底する
- shadcnをそのまま使わない（必要なら参考にして独自実装）
- アニメーションは Framer Motion で統一する
- 全コンポーネントに empty / loading / error 状態を用意する

## 必須UIパーツ一覧

### Toast（操作フィードバック）
```tsx
"use client"
import { motion, AnimatePresence } from "framer-motion"

export function Toast({ message, type = "default" }: ToastProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.95 }}
      animate={{ opacity: 1, y: 0,  scale: 1 }}
      exit={{    opacity: 0, y: 16, scale: 0.95 }}
      className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50
                 px-4 py-3 rounded-2xl bg-neutral-900 text-white
                 text-[15px] font-medium shadow-lg"
    >
      {message}
    </motion.div>
  )
}
```

### Confirm Dialog
```tsx
export function ConfirmDialog({ title, message, onConfirm, onCancel }: ConfirmDialogProps) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <motion.div
        className="relative w-full max-w-sm mx-4 bg-white rounded-2xl overflow-hidden"
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0,  opacity: 1 }}
      >
        <div className="p-6 text-center">
          <h3 className="text-[17px] font-semibold mb-1">{title}</h3>
          <p className="text-[15px] text-neutral-500">{message}</p>
        </div>
        <div className="border-t border-neutral-100 flex divide-x divide-neutral-100">
          <button onClick={onCancel}
            className="flex-1 py-4 text-[17px] text-neutral-500">
            キャンセル
          </button>
          <button onClick={onConfirm}
            className="flex-1 py-4 text-[17px] font-medium text-red-500">
            削除
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
```

### Loading UI
```tsx
export function LoadingRows({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-1 px-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i}
          className="h-12 rounded-xl bg-neutral-100 animate-pulse"
          style={{ opacity: 1 - i * 0.15 }}
        />
      ))}
    </div>
  )
}
```

### Bottom Tab Navigation（iPhone）
```tsx
export function BottomNav() {
  const tabs = [
    { href: "/home",     icon: House,      label: "ホーム" },
    { href: "/fridge",   icon: Refrigerator, label: "冷蔵庫" },
    { href: "/calendar", icon: Calendar,   label: "予定" },
    { href: "/money",    icon: Wallet,     label: "家計" },
    { href: "/board",    icon: MessageCircle, label: "掲示板" },
  ]

  return (
    <nav className="fixed bottom-0 inset-x-0 bg-white/80 backdrop-blur-xl
                    border-t border-neutral-200 pb-safe">
      <div className="flex">
        {tabs.map(tab => (
          <NavTab key={tab.href} {...tab} />
        ))}
      </div>
    </nav>
  )
}
```

## カラーパレット（Ami-ru）
```css
/* src/styles/globals.css */
:root {
  --color-bg:       #FAFAF8;   /* 温かみのある白 */
  --color-surface:  #FFFFFF;
  --color-border:   #E8E8E4;
  --color-text:     #1A1A18;
  --color-sub:      #8A8A82;
  --color-accent:   #FF6B6B;   /* 2人感のあるアクセント */
  --color-accent-2: #6B9EFF;   /* パートナーカラー */
}
```

## フォント設定
```css
/* system-ui でiOS/macOS のSF Pro風に */
body {
  font-family: -apple-system, BlinkMacSystemFont,
    "Hiragino Sans", "Hiragino Kaku Gothic ProN",
    sans-serif;
  -webkit-font-smoothing: antialiased;
}
```
