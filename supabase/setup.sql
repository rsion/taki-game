-- Run this in your Supabase Dashboard > SQL Editor
-- This creates the games table for persisting game state

CREATE TABLE IF NOT EXISTS games (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  code text UNIQUE NOT NULL,
  status text DEFAULT 'waiting',
  game_state jsonb,
  host_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE games ENABLE ROW LEVEL SECURITY;

-- Allow all operations (game uses service_role key server-side)
CREATE POLICY "Allow all operations" ON games
  FOR ALL USING (true) WITH CHECK (true);

-- Index for fast lookups by room code
CREATE INDEX IF NOT EXISTS idx_games_code ON games (code);

-- Auto-cleanup: delete games older than 24 hours
-- (optional: run this as a cron in Supabase)
-- DELETE FROM games WHERE created_at < now() - interval '24 hours';
