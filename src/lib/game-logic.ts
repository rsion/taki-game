import { Card, CardColor, GameState, PlayerView } from './types';
import { createDeck, shuffle } from './deck';

export function createInitialGameState(roomCode: string, hostId: string): GameState {
  return {
    deck: [],
    discardPile: [],
    players: [],
    currentPlayerIndex: 0,
    direction: 1,
    status: 'waiting',
    activeColor: null,
    takiMode: { active: false, color: null, playerId: null },
    pendingDrawCount: 0,
    winnerId: null,
    roomCode,
    hostId,
  };
}

export function addPlayer(state: GameState, playerId: string, playerName: string): GameState {
  const s = clone(state);
  if (s.players.length >= 4) throw new Error('Game is full (max 4 players)');
  if (s.status !== 'waiting') throw new Error('Game already started');
  if (s.players.find(p => p.id === playerId)) throw new Error('Already in game');
  s.players.push({ id: playerId, name: playerName, cards: [] });
  return s;
}

export function startGame(state: GameState): GameState {
  if (state.players.length < 2) throw new Error('Need at least 2 players');
  if (state.status !== 'waiting') throw new Error('Game already started');

  const s = clone(state);
  const deck = createDeck();
  s.deck = deck;
  s.status = 'playing';

  // Deal 8 cards to each player
  for (const player of s.players) {
    player.cards = s.deck.splice(0, 8);
  }

  // Flip first number card to start discard pile
  let startCard = s.deck.shift()!;
  let safety = 0;
  while (startCard.type !== 'number' && safety < 200) {
    s.deck.push(startCard);
    s.deck = shuffle(s.deck);
    startCard = s.deck.shift()!;
    safety++;
  }

  s.discardPile = [startCard];
  s.activeColor = startCard.color;
  s.currentPlayerIndex = 0;

  return s;
}

export function canPlayCard(state: GameState, card: Card, playerId: string): boolean {
  const playerIndex = state.players.findIndex(p => p.id === playerId);
  if (playerIndex !== state.currentPlayerIndex) return false;

  // If pending +2 stack, can only play +2
  if (state.pendingDrawCount > 0) {
    return card.type === 'draw_two';
  }

  // During taki mode
  if (state.takiMode.active && state.takiMode.playerId === playerId) {
    if (card.color === state.takiMode.color) return true;
    if (card.type === 'super_taki' || card.type === 'change_color') return true;
    return false;
  }

  // Wild cards always playable
  if (card.type === 'super_taki' || card.type === 'change_color') return true;

  // Match by color
  if (card.color === state.activeColor) return true;

  // Match by number
  const topCard = state.discardPile[state.discardPile.length - 1];
  if (card.type === 'number' && topCard.type === 'number' && card.value === topCard.value) return true;

  // Match by type (action cards)
  if (card.type !== 'number' && card.type === topCard.type) return true;

  return false;
}

export function playCard(
  state: GameState,
  playerId: string,
  cardId: string,
  chosenColor?: CardColor
): GameState {
  const s = clone(state);
  const playerIndex = s.players.findIndex(p => p.id === playerId);
  if (playerIndex < 0) throw new Error('Player not found');
  if (playerIndex !== s.currentPlayerIndex) throw new Error('Not your turn');

  const player = s.players[playerIndex];
  const cardIndex = player.cards.findIndex(c => c.id === cardId);
  if (cardIndex === -1) throw new Error('Card not in hand');

  const card = player.cards[cardIndex];
  if (!canPlayCard(state, card, playerId)) throw new Error('Cannot play this card');

  // Remove card from hand, add to discard
  player.cards.splice(cardIndex, 1);
  s.discardPile.push(card);

  // Set active color
  if (card.color) {
    s.activeColor = card.color;
  } else if (chosenColor) {
    s.activeColor = chosenColor;
  }

  // Check win (not during taki — win is checked on close)
  if (player.cards.length === 0 && !s.takiMode.active && card.type !== 'taki' && card.type !== 'super_taki') {
    s.status = 'finished';
    s.winnerId = playerId;
    return s;
  }

  // Apply effects
  switch (card.type) {
    case 'number':
      if (!s.takiMode.active) advanceTurn(s);
      break;

    case 'taki':
      s.takiMode = { active: true, color: card.color, playerId };
      break;

    case 'super_taki':
      s.takiMode = { active: true, color: chosenColor || null, playerId };
      s.activeColor = chosenColor || null;
      break;

    case 'plus':
      // Player gets another turn — don't advance
      // If in taki mode, just continue sequence
      break;

    case 'stop':
      if (!s.takiMode.active) {
        advanceTurn(s); // skip one
        advanceTurn(s); // land on next
      }
      break;

    case 'change_direction':
      s.direction = (s.direction === 1 ? -1 : 1) as 1 | -1;
      if (!s.takiMode.active) {
        if (s.players.length === 2) {
          advanceTurn(s);
          advanceTurn(s);
        } else {
          advanceTurn(s);
        }
      }
      break;

    case 'draw_two':
      s.pendingDrawCount += 2;
      if (!s.takiMode.active) advanceTurn(s);
      break;

    case 'change_color':
      s.activeColor = chosenColor || null;
      if (!s.takiMode.active) advanceTurn(s);
      break;
  }

  // Win during taki if hand empty
  if (player.cards.length === 0 && s.takiMode.active) {
    s.takiMode = { active: false, color: null, playerId: null };
    s.status = 'finished';
    s.winnerId = playerId;
  }

  return s;
}

export function closeTaki(state: GameState, playerId: string): GameState {
  if (!state.takiMode.active || state.takiMode.playerId !== playerId) {
    throw new Error('Not in taki mode');
  }

  const s = clone(state);
  s.takiMode = { active: false, color: null, playerId: null };

  const lastCard = s.discardPile[s.discardPile.length - 1];

  if (lastCard.type === 'plus') {
    // Another turn — don't advance
  } else if (lastCard.type === 'stop') {
    advanceTurn(s);
    advanceTurn(s);
  } else if (lastCard.type === 'change_direction') {
    // Direction already changed when played
    if (s.players.length === 2) {
      advanceTurn(s);
      advanceTurn(s);
    } else {
      advanceTurn(s);
    }
  } else if (lastCard.type === 'draw_two') {
    // pendingDrawCount already set
    advanceTurn(s);
  } else {
    advanceTurn(s);
  }

  // Check win
  const player = s.players.find(p => p.id === playerId)!;
  if (player.cards.length === 0) {
    s.status = 'finished';
    s.winnerId = playerId;
  }

  return s;
}

export function drawCard(state: GameState, playerId: string): GameState {
  const s = clone(state);
  const playerIndex = s.players.findIndex(p => p.id === playerId);
  if (playerIndex < 0) throw new Error('Player not found');
  if (playerIndex !== s.currentPlayerIndex) throw new Error('Not your turn');

  const player = s.players[playerIndex];
  const drawCount = s.pendingDrawCount > 0 ? s.pendingDrawCount : 1;

  for (let i = 0; i < drawCount; i++) {
    ensureDeck(s);
    if (s.deck.length > 0) {
      player.cards.push(s.deck.shift()!);
    }
  }

  s.pendingDrawCount = 0;
  advanceTurn(s);
  return s;
}

function advanceTurn(state: GameState): void {
  const n = state.players.length;
  state.currentPlayerIndex = ((state.currentPlayerIndex + state.direction) % n + n) % n;
}

function ensureDeck(state: GameState): void {
  if (state.deck.length === 0 && state.discardPile.length > 1) {
    const topCard = state.discardPile.pop()!;
    state.deck = shuffle(state.discardPile);
    state.discardPile = [topCard];
  }
}

export function getPlayerView(state: GameState, playerId: string): PlayerView {
  return {
    discardPile: state.discardPile.slice(-3), // last 3 cards for display
    deckCount: state.deck.length,
    players: state.players.map(p => ({
      id: p.id,
      name: p.name,
      cardCount: p.cards.length,
    })),
    myCards: state.players.find(p => p.id === playerId)?.cards || [],
    currentPlayerIndex: state.currentPlayerIndex,
    direction: state.direction,
    status: state.status,
    activeColor: state.activeColor,
    takiMode: state.takiMode,
    pendingDrawCount: state.pendingDrawCount,
    winnerId: state.winnerId,
    roomCode: state.roomCode,
    hostId: state.hostId,
    myId: playerId,
  };
}

function clone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}
