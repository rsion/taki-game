-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- to enable database-backed game persistence

CREATE TABLE IF NOT EXISTS games (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'waiting',
  game_state JSONB NOT NULL DEFAULT '{}',
  host_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE games REPLICA IDENTITY FULL;
CREATE INDEX IF NOT EXISTS idx_games_code ON games(code);

-- Allow all access (no auth in this game)
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_all" ON games FOR ALL USING (true) WITH CHECK (true);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE games;
