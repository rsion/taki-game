import { Card, CardColor, CardType } from './types';

const COLORS: CardColor[] = ['red', 'blue', 'green', 'yellow'];

let cardIdCounter = 0;

function genId(): string {
  return `c${++cardIdCounter}_${Math.random().toString(36).substring(2, 8)}`;
}

export function createDeck(): Card[] {
  cardIdCounter = 0;
  const cards: Card[] = [];

  for (const color of COLORS) {
    // Number cards 1-9, two copies each
    for (let num = 1; num <= 9; num++) {
      for (let copy = 0; copy < 2; copy++) {
        cards.push({ id: genId(), color, type: 'number', value: num });
      }
    }
    // Action cards, two copies each per color
    const actions: CardType[] = ['taki', 'plus', 'stop', 'change_direction', 'draw_two'];
    for (const type of actions) {
      for (let copy = 0; copy < 2; copy++) {
        cards.push({ id: genId(), color, type });
      }
    }
  }

  // Colorless special cards (2 each)
  for (let copy = 0; copy < 2; copy++) {
    cards.push({ id: genId(), color: null, type: 'super_taki' });
    cards.push({ id: genId(), color: null, type: 'change_color' });
  }

  return shuffle(cards);
}

export function shuffle<T>(array: T[]): T[] {
  const a = [...array];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
