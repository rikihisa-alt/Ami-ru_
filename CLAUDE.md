# Ami-ru — 同棲2人の生活OS

## Purpose
同棲している2人の生活をまとめる生活共有システム。
家計簿アプリでもTodoアプリでもなく「2人の生活OS」として設計する。
冷蔵庫・予定・家計・掲示板・Todo・行きたいところを一つにまとめる。

## 最重要方針
「生成AIが作ったようなUI」を完全に排除する。
目標はiOS / macOSネイティブアプリのような体験。
Apple Reminders / Apple Notes / Things / Bear のような
ミニマルだけど触って気持ちいいUI。

## Stack
- Next.js 14（App Router） + TypeScript
- Tailwind CSS
- Framer Motion（モーション）
- Supabase（DB・認証・リアルタイム）
- Vercel（デプロイ） + GitHub

## Repo Map
src/
├── app/
│   ├── (auth)/            ログイン・登録・招待
│   ├── (app)/             メインアプリ（ペア認証済み）
│   │   ├── home/          ホーム
│   │   ├── fridge/        冷蔵庫管理
│   │   ├── calendar/      予定共有
│   │   ├── money/         家計簿
│   │   ├── board/         掲示板
│   │   ├── todo/          Todo
│   │   └── places/        行きたいところ
│   └── api/               API Routes
├── components/
│   ├── ui/                汎用UIパーツ（Apple思想）
│   ├── features/          機能別コンポーネント
│   └── layout/            ナビゲーション・レイアウト
├── features/              機能ロジック（UIから分離）
│   ├── auth/
│   ├── pair/
│   ├── fridge/
│   ├── calendar/
│   ├── money/
│   ├── board/
│   ├── todo/
│   └── places/
├── lib/
│   ├── supabase/          Supabaseクライアント
│   ├── types/             型定義
│   └── utils/             ユーティリティ
└── styles/                グローバルCSS

## UI構造
iPhone: タブ構造（Home / Fridge / Calendar / Money / Board）
Mac: 2ペインまたは3ペイン構造

## Design Rules

### 禁止事項（絶対に守ること）
- SaaSテンプレート構造（Hero→Features→Cards→FAQ→CTA）
- カードUIの乱用・均等グリッド量産
- 過剰なグラデーション・影
- Inter + カード量産UI
- shadcnをそのまま組む
- AIっぽい余白・タイポ
- Dribbble風過剰デザイン
- 意味のないアニメーション

### 許可される方向（Apple系UI思想）
- 静かなUI・情報密度が高い
- タイポグラフィ主導の階層
- 落ち着いたモーション（自然・軽快）
- 操作の気持ちよさ・フィードバック
- 余白は「AIっぽい均等余白」ではなく意図的な設計

### デザインコンセプト
- 生活アプリ・温度感がある・落ち着いた・上品
- かわいい = 子供っぽいではない
- 情報整理が美しい

## UX必須要素
以下は全画面で必ず整備する:
- empty state（データがないとき）
- loading UI（読み込み中）
- error UI（エラー時）
- confirm dialog（削除など）
- toast（操作フィードバック）
- 自然なモーション

## Coding Rules
- any禁止。型は必ず明示する
- Server ComponentとClient Componentを明確に分ける
- "use client"はインタラクション・Framer Motion・フォームが必要なものだけ
- 画像はnext/imageを使う
- リンクはnext/linkを使う
- 機能ロジックはsrc/features/に集約しUIから分離する
- コンポーネントは1ファイル200行を目安に分割する
- モバイルファーストで実装する

## DB Schema（Supabase）
- users: id, email, name, avatar_url, created_at
- pairs: id, name, created_by, created_at
- pair_members: id, pair_id, user_id, role, joined_at
- invitations: id, pair_id, code, expires_at, used_at, created_by
- fridge_items: id, pair_id, name, category, quantity, unit, expires_at, created_by
- events: id, pair_id, title, start_at, end_at, memo, created_by
- expenses: id, pair_id, title, amount, category, paid_by, is_shared, date, memo
- board_posts: id, pair_id, content, image_url, is_pinned, created_by
- todos: id, pair_id, title, assigned_to, due_date, is_done, created_by
- places: id, pair_id, name, url, tag, memo, is_scheduled, created_by

## Commands
- dev:   npm run dev
- build: npm run build
- lint:  npm run lint
- type:  npm run typecheck

## Important
- 既存コードを解析してから手を入れる（いきなり書き換えない）
- 問題点を整理してから実装方針を確認する
- 不明点は推測で実装せず、先に確認する
- ペアに所属していないユーザーは(app)/以下にアクセスできない
