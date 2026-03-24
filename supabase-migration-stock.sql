-- ストック機能拡張: 保管場所カラムを追加
-- Supabase Dashboard → SQL Editor で実行してください

ALTER TABLE pantry_items
  ADD COLUMN IF NOT EXISTS storage_location TEXT DEFAULT 'fridge';

-- 既存データにデフォルト値を設定
UPDATE pantry_items SET storage_location = 'fridge' WHERE storage_location IS NULL;

-- インデックス追加（保管場所でのフィルタリング高速化）
CREATE INDEX IF NOT EXISTS idx_pantry_items_storage_location
  ON pantry_items(storage_location);
