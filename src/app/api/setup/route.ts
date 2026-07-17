import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { Pool } from 'pg';

const SETUP_SQL = `
CREATE TABLE IF NOT EXISTS games (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  code text UNIQUE NOT NULL,
  status text DEFAULT 'waiting',
  game_state jsonb,
  host_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE games ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'games' AND policyname = 'Allow all operations'
  ) THEN
    CREATE POLICY "Allow all operations" ON games FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_games_code ON games (code);
`;

// One-time setup endpoint: creates the games table
// Hit GET /api/setup once after deploying
export async function GET() {
  const supabase = createServerClient();

  // Check if table already exists
  const { error } = await supabase.from('games').select('code').limit(0);
  if (!error) {
    return NextResponse.json({ message: 'Table already exists', status: 'ok' });
  }

  // Try creating via direct pg connection
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const ref = supabaseUrl.replace('https://', '').replace('.supabase.co', '');
  const dbPassword = process.env.SUPABASE_DB_PASSWORD || process.env.DATABASE_URL;

  // Use the Supabase direct connection
  const connectionString =
    process.env.DATABASE_URL ||
    `postgresql://postgres.${ref}:${dbPassword || 'YOUR_DB_PASSWORD'}@aws-0-eu-central-1.pooler.supabase.com:6543/postgres`;

  // If no DB password available, return SQL for manual execution
  if (!dbPassword && !process.env.DATABASE_URL) {
    return NextResponse.json({
      message: 'Games table not found. Please run this SQL in your Supabase Dashboard > SQL Editor.',
      sql: SETUP_SQL.trim(),
      note: 'The game works without the DB table (uses in-memory + Supabase Realtime), but DB persistence helps with reconnection.',
    });
  }

  try {
    const pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } });
    await pool.query(SETUP_SQL);
    await pool.end();
    return NextResponse.json({ message: 'Table created successfully!', status: 'ok' });
  } catch (pgError: any) {
    return NextResponse.json({
      message: 'Could not auto-create table. Please run the SQL manually in Supabase Dashboard > SQL Editor.',
      sql: SETUP_SQL.trim(),
      error: pgError.message,
    });
  }
}
