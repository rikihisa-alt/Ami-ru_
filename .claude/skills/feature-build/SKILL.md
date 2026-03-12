---
name: feature-build
description: Ami-ruの機能を新規実装するときに使う。「冷蔵庫機能を作って」「家計簿を実装して」「招待システムを作って」「カレンダーを実装して」と言ったときに使う。Next.js + TypeScript + Supabase 前提。
---

# Feature Build — Ami-ru

## 実装前に必ずやること
1. CLAUDE.md のDesign Rules・Coding Rulesを確認する
2. 該当featureのロジックがsrc/features/に既にないか確認する
3. Supabaseのスキーマと型定義を確認する
4. 実装方針を説明してから着手する

## ペア認証パターン（全機能共通）
```typescript
// src/lib/utils/pair.ts
export async function requirePair(userId: string) {
  const { data: member } = await supabase
    .from("pair_members")
    .select("pair_id, pairs(*)")
    .eq("user_id", userId)
    .single()

  if (!member) redirect("/pair/setup")
  return member
}
```

## Supabaseデータ取得パターン
```typescript
// Server Component での取得
export default async function FridgePage() {
  const { data: items } = await supabase
    .from("fridge_items")
    .select("*")
    .eq("pair_id", pairId)
    .order("expires_at", { ascending: true })

  return <FridgeList items={items ?? []} />
}
```

```typescript
// リアルタイム更新（Client Component）
"use client"
useEffect(() => {
  const channel = supabase
    .channel("fridge")
    .on("postgres_changes",
      { event: "*", schema: "public", table: "fridge_items" },
      () => router.refresh()
    )
    .subscribe()

  return () => { supabase.removeChannel(channel) }
}, [])
```

## 機能別の実装ポイント

### 1. ペアアカウント / 招待システム
- 招待コードはランダム8文字・有効期限24時間
- 1ユーザー = 1ペアのみ（複数ペア禁止）
- ペア参加後は招待コードを無効化する

### 2. 冷蔵庫管理
- 期限切れ・期限間近（3日以内）を色で区別する
- スワイプで消費・削除できるUI
- カテゴリ: 野菜 / 肉魚 / 乳製品 / 調味料 / 飲み物 / その他

### 3. 予定共有
- モバイル: 今日・今週の2ビュー
- デスクトップ: 月カレンダー + リスト
- 2人の予定を色で区別する

### 4. 家計簿
- 支払者（自分 / パートナー）を記録する
- 共有/個人を区別する
- 月次で「どっちが多く払ったか」の差額を表示する
- カテゴリ: 食費 / 外食 / 日用品 / 光熱費 / 娯楽 / その他

### 5. 掲示板
- 投稿は最新順
- ピン留めは上部に固定
- 既読状態をリアルタイムで更新

### 6. Todo
- 担当者（自分 / パートナー / 2人）
- 期限あり / なし
- 完了したものは下部に収納

### 7. 行きたいところ
- URL保存時にOGP情報を自動取得する
- タグで分類する
- 予定化ボタンでカレンダーに追加できる

## 実装後に必ずやること
1. npm run typecheck
2. npm run lint
3. empty / loading / error の各状態を実装する
4. ペア未参加ユーザーがアクセスできないことを確認する
5. モバイル（390px）で動作確認する
