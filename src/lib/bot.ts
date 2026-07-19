import { GameState, Card, CardColor } from './types';
import { canPlayCard, playCard, drawCard, closeTaki } from './game-logic';

export const BOT_ID = 'bot-player';
export const BOT_NAME = 'מחשב';

/**
 * Bot makes one move. Returns the new game state.
 * Called repeatedly via useEffect — TAKI mode chains naturally.
 */
export function botPlay(state: GameState): GameState {
  const bot = state.players.find(p => p.id === BOT_ID);
  if (!bot) return state;

  // ── TAKI mode: play another matching card or close ──
  if (state.takiMode.active && state.takiMode.playerId === BOT_ID) {
    const playable = bot.cards.filter(c => canPlayCard(state, c, BOT_ID));
    if (playable.length > 0) {
      const chosen = pickBest(playable);
      if (chosen.type === 'change_color' || chosen.type === 'super_taki') {
        return playCard(state, BOT_ID, chosen.id, pickBestColor(bot.cards));
      }
      return playCard(state, BOT_ID, chosen.id);
    }
    return closeTaki(state, BOT_ID);
  }

  // ── Normal turn ──
  const playable = bot.cards.filter(c => canPlayCard(state, c, BOT_ID));

  if (playable.length === 0) {
    return drawCard(state, BOT_ID);
  }

  const chosen = pickBest(playable);

  if (chosen.type === 'change_color' || chosen.type === 'super_taki') {
    return playCard(state, BOT_ID, chosen.id, pickBestColor(bot.cards));
  }

  return playCard(state, BOT_ID, chosen.id);
}

/* ── Strategy helpers ────────────────────────────────────── */

function pickBest(cards: Card[]): Card {
  return [...cards].sort((a, b) => priority(b) - priority(a))[0];
}

function priority(card: Card): number {
  switch (card.type) {
    case 'draw_two':         return 10;
    case 'stop':             return 9;
    case 'taki':             return 8;
    case 'change_direction': return 7;
    case 'plus':             return 6;
    case 'super_taki':       return 5;
    case 'change_color':     return 4;
    case 'number':           return card.value ?? 0;
    default:                 return 0;
  }
}

function pickBestColor(cards: Card[]): CardColor {
  const counts: Record<string, number> = { red: 0, blue: 0, green: 0, yellow: 0 };
  cards.forEach(c => { if (c.color) counts[c.color]++; });
  return (Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'red') as CardColor;
}
