import { NextResponse } from 'next/server';
import { playCard, drawCard, closeTaki, startGame } from '@/lib/game-logic';
import { loadGame, saveGame, broadcastState } from '@/lib/game-store';
import { CardColor } from '@/lib/types';

interface ActionPayload {
  code: string;
  playerId: string;
  action: {
    type: 'play_card' | 'draw_card' | 'close_taki' | 'start_game';
    cardId?: string;
    chosenColor?: CardColor;
  };
}

export async function POST(request: Request) {
  try {
    const { code, playerId, action } = (await request.json()) as ActionPayload;

    if (!code || !playerId || !action) {
      return NextResponse.json({ error: 'Missing code, playerId, or action' }, { status: 400 });
    }

    let state = await loadGame(code.toUpperCase());
    if (!state) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }

    switch (action.type) {
      case 'play_card':
        if (!action.cardId) {
          return NextResponse.json({ error: 'cardId required' }, { status: 400 });
        }
        state = playCard(state, playerId, action.cardId, action.chosenColor);
        break;

      case 'draw_card':
        state = drawCard(state, playerId);
        break;

      case 'close_taki':
        state = closeTaki(state, playerId);
        break;

      case 'start_game':
        if (state.hostId !== playerId) {
          return NextResponse.json({ error: 'Only the host can start the game' }, { status: 403 });
        }
        state = startGame(state);
        break;

      default:
        return NextResponse.json({ error: 'Unknown action type' }, { status: 400 });
    }

    await saveGame(code.toUpperCase(), state);
    await broadcastState(code.toUpperCase(), state);

    return NextResponse.json({ success: true, status: state.status });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Action failed' }, { status: 500 });
  }
}
