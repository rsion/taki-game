import { GameState } from './types';
import { createServerClient } from './supabase';

// In-memory game state store
// On Vercel serverless, each invocation may use a different instance,
// so we also persist to Supabase for consistency
const gameStates = new Map<string, GameState>();

const supabase = createServerClient();

// Try to use Supabase 'games' table; fall back to in-memory only
let useDb = true;

async function ensureTable(): Promise<boolean> {
  try {
    const { error } = await supabase.from('games').select('code').limit(0);
    if (error && error.message.includes('does not exist')) {
      useDb = false;
      return false;
    }
    return true;
  } catch {
    useDb = false;
    return false;
  }
}

// Initialize on first call
let tableChecked = false;
async function checkTable() {
  if (!tableChecked) {
    await ensureTable();
    tableChecked = true;
  }
}

export async function saveGame(code: string, state: GameState): Promise<void> {
  gameStates.set(code, state);
  await checkTable();
  if (useDb) {
    try {
      const { error } = await supabase
        .from('games')
        .upsert({
          code,
          status: state.status,
          game_state: state,
          host_id: state.hostId,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'code' });
      if (error) {
        console.warn('DB save failed, using in-memory:', error.message);
        useDb = false;
      }
    } catch {
      useDb = false;
    }
  }
}

export async function loadGame(code: string): Promise<GameState | null> {
  // Check in-memory first
  const cached = gameStates.get(code);
  if (cached) return cached;

  await checkTable();
  if (useDb) {
    try {
      const { data, error } = await supabase
        .from('games')
        .select('game_state')
        .eq('code', code)
        .single();
      if (!error && data?.game_state) {
        const state = data.game_state as GameState;
        gameStates.set(code, state);
        return state;
      }
    } catch {
      // Ignore DB errors
    }
  }

  return null;
}

export async function broadcastState(code: string, state: GameState): Promise<void> {
  try {
    const channel = supabase.channel(`game:${code}`);
    await channel.send({
      type: 'broadcast',
      event: 'state_update',
      payload: { state },
    });
    supabase.removeChannel(channel);
  } catch (err) {
    console.warn('Broadcast failed:', err);
  }
}

export function generateRoomCode(): string {
  const chars = '0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}
