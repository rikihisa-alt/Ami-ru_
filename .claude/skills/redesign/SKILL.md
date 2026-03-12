---
name: redesign
description: Ami-ruの既存コードを解析し、UI/UXを再設計・実装するときに使う。「UIを直して」「再設計して」「Apple風にして」「AIっぽさを消して」「コンポーネントを整理して」と言ったときに使う。既存コードの解析から実装まで一貫して行う。
---

# Redesign — Ami-ru

## 作業の進め方（この順番を守る）

### Phase 1: コードベース解析
```bash
# 現在の構造を把握する
find src -type f -name "*.tsx" | head -50
find src -type f -name "*.ts" | head -30
```
- コンポーネント構造・命名を確認する
- 既存の型定義を確認する
- どこまで実装済みか把握する

### Phase 2: 問題点の整理
解析後、以下を報告する:
- AIっぽいUIの具体的な箇所
- 構造上の問題点
- 型定義の問題
- コンポーネント分割の問題
- 実装済み vs 未実装の整理

### Phase 3: 実装方針の確認
問題点を報告したうえで、実装方針を提示して確認を取る。
いきなり全部書き換えない。

### Phase 4: 実装
確認が取れたら実装する。

## Apple UI思想の実装パターン

### タイポグラフィ主導の情報階層
```tsx
// NG: カードで情報を包む
<Card>
  <CardTitle>タイトル</CardTitle>
  <CardContent>内容</CardContent>
</Card>

// OK: タイポグラフィとスペースで階層を作る
<section className="px-4 py-6">
  <h2 className="text-xs font-medium text-neutral-400 uppercase tracking-wider mb-3">
    今日の予定
  </h2>
  <div className="space-y-1">
    {items.map(item => <EventRow key={item.id} item={item} />)}
  </div>
</section>
```

### リスト行のUI（Apple Reminders風）
```tsx
export function ListRow({ item, onTap }: ListRowProps) {
  return (
    <motion.div
      className="flex items-center gap-3 px-4 py-3 active:bg-neutral-100 transition-colors"
      whileTap={{ scale: 0.99 }}
    >
      <div className="w-5 h-5 rounded-full border-2 border-neutral-300 flex-shrink-0" />
      <span className="flex-1 text-[17px] text-neutral-900 leading-snug">
        {item.title}
      </span>
      <ChevronRight className="w-4 h-4 text-neutral-300" />
    </motion.div>
  )
}
```

### セクションヘッダー（iOS設定画面風）
```tsx
export function SectionHeader({ title }: { title: string }) {
  return (
    <div className="px-4 pt-6 pb-2">
      <h2 className="text-[13px] font-medium text-neutral-400 uppercase tracking-wide">
        {title}
      </h2>
    </div>
  )
}
```

### モーション（自然・軽快）
```tsx
// ページ遷移
const pageVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: -8 }
}

// リスト項目の登場
const listItemVariants = {
  hidden: { opacity: 0, x: -8 },
  show:   { opacity: 1, x: 0 }
}

// タップフィードバック
<motion.button whileTap={{ scale: 0.97 }}>
```

### Empty State（温度感のある）
```tsx
export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-8 text-center">
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="text-[17px] font-semibold text-neutral-800 mb-1">{title}</h3>
      <p className="text-[15px] text-neutral-400 leading-relaxed mb-6">{description}</p>
      {action && (
        <button className="text-[15px] font-medium text-blue-500">{action}</button>
      )}
    </div>
  )
}
```

## 禁止パターンの置き換え

| 禁止 | 代替 |
|------|------|
| `<Card>` で情報を包む | セクション + リスト行 |
| 3列グリッド | 縦リスト or 2列最大 |
| 過剰なshadow | border-b 1px または無し |
| gradient背景 | 単色 or subtle texture |
| 均等padding | 意図的な余白設計 |
| Inter font | SF Pro風の system-ui |

## 実装後に必ずやること
1. npm run typecheck
2. npm run lint
3. iPhone実機サイズ（390px）で確認
4. Mac（1440px）で確認
5. empty / loading / error の各状態を確認
