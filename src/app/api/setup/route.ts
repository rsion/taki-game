import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

// One-time setup endpoint: creates the games table if it doesn't exist
// Hit GET /api/setup once after deploying
export async function GET() {
  const supabase = createServerClient();
  
  // Check if table exists by attempting a query
  const { error } = await supabase.from('games').select('code').limit(0);
  
  if (!error) {
    return NextResponse.json({ message: 'Table already exists', status: 'ok' });
  }
  
  // Table doesn't exist - provide instructions
  return NextResponse.json({
    message: 'Games table not found. Please run the SQL in supabase/setup.sql via your Supabase Dashboard > SQL Editor.',
    sql: `CREATE TABLE IF NOT EXISTS games (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  code text UNIQUE NOT NULL,
  status text DEFAULT 'waiting',
  game_state jsonb,
  host_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations" ON games FOR ALL USING (true) WITH CHECK (true);`,
    note: 'The game works without the DB table (uses in-memory + Supabase Realtime), but DB persistence helps with reconnection.'
  });
}
