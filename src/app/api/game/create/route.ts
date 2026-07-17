import { NextResponse } from 'next/server';
import { createInitialGameState, addPlayer } from '@/lib/game-logic';
import { saveGame, generateRoomCode } from '@/lib/game-store';

export async function POST(request: Request) {
  try {
    const { playerName } = await request.json();
    if (!playerName || typeof playerName !== 'string' || !playerName.trim()) {
      return NextResponse.json({ error: 'Player name is required' }, { status: 400 });
    }

    const code = generateRoomCode();
    const playerId = crypto.randomUUID();

    // Create game state and add host as first player
    let state = createInitialGameState(code, playerId);
    state = addPlayer(state, playerId, playerName.trim());
    await saveGame(code, state);

    return NextResponse.json({
      code,
      playerId,
      playerName: playerName.trim(),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to create game' }, { status: 500 });
  }
}
