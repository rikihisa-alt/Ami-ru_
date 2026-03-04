-- Expand mood range from 1-5 to 1-11 for more mood variations (including イライラ)
ALTER TABLE mood_logs DROP CONSTRAINT IF EXISTS mood_logs_mood_check;
ALTER TABLE mood_logs ADD CONSTRAINT mood_logs_mood_check CHECK (mood BETWEEN 1 AND 11);
