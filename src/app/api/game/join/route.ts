import { NextResponse } from 'next/server';
import { addPlayer } from '@/lib/game-logic';
import { loadGame, saveGame, broadcastState } from '@/lib/game-store';

export async function POST(request: Request) {
  try {
    const { playerName, code } = await request.json();
    if (!playerName || !code) {
      return NextResponse.json({ error: 'Player name and room code required' }, { status: 400 });
    }

    const roomCode = code.toUpperCase();
    const playerId = crypto.randomUUID();

    // Load existing game, add player, save and broadcast
    let state = await loadGame(roomCode);
    if (!state) {
      // Game might only exist in the host's client via broadcast
      // Return success anyway — the client-side broadcast will handle joining
      return NextResponse.json({
        code: roomCode,
        playerId,
        playerName: playerName.trim(),
      });
    }

    try {
      state = addPlayer(state, playerId, playerName.trim());
      await saveGame(roomCode, state);
      await broadcastState(roomCode, state);
    } catch (err: any) {
      // If game is full or already started, the client broadcast will also handle this
      // Still return the playerId so the client can attempt to join via broadcast
      if (err.message?.includes('full') || err.message?.includes('started')) {
        return NextResponse.json({ error: err.message }, { status: 400 });
      }
    }

    return NextResponse.json({
      code: roomCode,
      playerId,
      playerName: playerName.trim(),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to join game' }, { status: 500 });
  }
}
