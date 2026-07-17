export type CardColor = 'red' | 'blue' | 'green' | 'yellow';

export type CardType =
  | 'number'
  | 'taki'
  | 'plus'
  | 'stop'
  | 'change_direction'
  | 'draw_two'
  | 'super_taki'
  | 'change_color';

export interface Card {
  id: string;
  color: CardColor | null;
  type: CardType;
  value?: number;
}

export interface Player {
  id: string;
  name: string;
  cards: Card[];
}

export interface TakiMode {
  active: boolean;
  color: CardColor | null;
  playerId: string | null;
}

export interface GameState {
  deck: Card[];
  discardPile: Card[];
  players: Player[];
  currentPlayerIndex: number;
  direction: 1 | -1;
  status: 'waiting' | 'playing' | 'finished';
  activeColor: CardColor | null;
  takiMode: TakiMode;
  pendingDrawCount: number;
  winnerId: string | null;
  roomCode: string;
  hostId: string;
}

export interface PlayerView {
  discardPile: Card[];
  deckCount: number;
  players: {
    id: string;
    name: string;
    cardCount: number;
  }[];
  myCards: Card[];
  currentPlayerIndex: number;
  direction: 1 | -1;
  status: 'waiting' | 'playing' | 'finished';
  activeColor: CardColor | null;
  takiMode: TakiMode;
  pendingDrawCount: number;
  winnerId: string | null;
  roomCode: string;
  hostId: string;
  myId: string;
}

export type GameAction =
  | { type: 'play_card'; cardId: string; chosenColor?: CardColor }
  | { type: 'draw_card' }
  | { type: 'close_taki' };
