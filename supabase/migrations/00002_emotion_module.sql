-- ============================================
-- Emotion Module: mood_logs + thanks_logs
-- ============================================

-- 感情ログテーブル
CREATE TABLE mood_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pair_id UUID NOT NULL REFERENCES pairs(id) ON DELETE CASCADE,
  mood INTEGER NOT NULL CHECK (mood BETWEEN 1 AND 5),
  note TEXT,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ありがとうログテーブル
CREATE TABLE thanks_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pair_id UUID NOT NULL REFERENCES pairs(id) ON DELETE CASCADE,
  message TEXT,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- インデックス
CREATE INDEX idx_mood_logs_pair_created ON mood_logs(pair_id, created_at DESC);
CREATE INDEX idx_mood_logs_user_created ON mood_logs(created_by, created_at DESC);
CREATE INDEX idx_thanks_logs_pair_created ON thanks_logs(pair_id, created_at DESC);

-- RLS有効化
ALTER TABLE mood_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE thanks_logs ENABLE ROW LEVEL SECURITY;

-- mood_logs RLS: 同じペアのメンバーのみアクセス可
CREATE POLICY "mood_logs_select" ON mood_logs
  FOR SELECT USING (pair_id = get_user_pair_id());

CREATE POLICY "mood_logs_insert" ON mood_logs
  FOR INSERT WITH CHECK (
    pair_id = get_user_pair_id()
    AND created_by = auth.uid()
  );

CREATE POLICY "mood_logs_delete" ON mood_logs
  FOR DELETE USING (created_by = auth.uid());

-- thanks_logs RLS: 同じペアのメンバーのみアクセス可
CREATE POLICY "thanks_logs_select" ON thanks_logs
  FOR SELECT USING (pair_id = get_user_pair_id());

CREATE POLICY "thanks_logs_insert" ON thanks_logs
  FOR INSERT WITH CHECK (
    pair_id = get_user_pair_id()
    AND created_by = auth.uid()
  );

CREATE POLICY "thanks_logs_delete" ON thanks_logs
  FOR DELETE USING (created_by = auth.uid());

-- Realtimeを有効化（既存パターンに合わせる）
ALTER PUBLICATION supabase_realtime ADD TABLE mood_logs;
ALTER PUBLICATION supabase_realtime ADD TABLE thanks_logs;
