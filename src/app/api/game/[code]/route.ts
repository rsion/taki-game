import { NextRequest, NextResponse } from 'next/server';
import { getPlayerView } from '@/lib/game-logic';
import { loadGame } from '@/lib/game-store';

export async function GET(
  request: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const code = params.code.toUpperCase();
    const playerId = request.nextUrl.searchParams.get('playerId');

    const state = await loadGame(code);
    if (!state) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }

    // If playerId provided, return filtered view (hides other players' cards)
    if (playerId) {
      const view = getPlayerView(state, playerId);
      return NextResponse.json(view);
    }

    // Without playerId, return basic info (no cards)
    return NextResponse.json({
      code: state.roomCode,
      status: state.status,
      playerCount: state.players.length,
      players: state.players.map(p => ({ id: p.id, name: p.name })),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to load game' }, { status: 500 });
  }
}
