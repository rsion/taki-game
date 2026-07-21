'use client';

import { Card as CardType } from '@/lib/types';

/* ════════════════════════════════════════════════════════════
   TAKI CARD — Real PNG assets from the official TAKI app,
   with CSS fallback for number-2 cards (no asset exists).
   ════════════════════════════════════════════════════════════ */

/* ── Taki Color Palette ──────────────────────────────────── */
const PAL: Record<string, { main: string; dark: string; deep: string; border: string }> = {
  red:    { main: '#E32636', dark: '#B81E2C', deep: '#8B1621', border: '#C92030' },
  blue:   { main: '#1472B8', dark: '#105B93', deep: '#0C446E', border: '#1266A6' },
  green:  { main: '#39A845', dark: '#2E8637', deep: '#226429', border: '#32963D' },
  yellow: { main: '#FDD835', dark: '#CAAD2A', deep: '#978220', border: '#E5C330' },
};

/* ── Scoring (unchanged) ─────────────────────────────────── */
export function cardPoints(card: CardType): number {
  if (card.type === 'number') return card.value ?? 0;
  if (card.type === 'change_color') return 20;
  if (card.type === 'super_taki') return 30;
  return 10;
}

/* ── Sizes ───────────────────────────────────────────────── */
function dims(small: boolean, large: boolean) {
  if (small) return { w: 50, h: 70, r: 5, bw: 1.5, fs: 30, cfs: 8, depth: 1, pad: 2 };
  if (large) return { w: 130, h: 182, r: 10, bw: 2, fs: 76, cfs: 15, depth: 4, pad: 6 };
  return { w: 90, h: 126, r: 8, bw: 1.5, fs: 52, cfs: 11, depth: 3, pad: 4 };
}

/* ── Image path mapper ───────────────────────────────────── */
function getCardImagePath(card: CardType): string | null {
  if (card.type === 'number') {
    if (card.value === 2) return null; // no real asset for number 2
    return `/cards/${card.color}_${card.value}.png`;
  }
  if (card.type === 'change_color') return '/cards/change_color.png';
  if (card.type === 'super_taki') return '/cards/super_taki.png';
  if (card.color) return `/cards/${card.color}_${card.type}.png`;
  return null;
}

/* ── 3D text-shadow extrusion (for CSS fallback) ─────────── */
function extrude(color: string, n: number): string {
  const parts: string[] = [];
  for (let i = 1; i <= n; i++) parts.push(`${i}px ${i}px 0 ${color}`);
  parts.push(`${n + 1}px ${n + 1}px ${n * 2}px rgba(0,0,0,0.25)`);
  return parts.join(', ');
}

/* ── Card component ──────────────────────────────────────── */
interface CardProps {
  card: CardType;
  playable?: boolean;
  small?: boolean;
  large?: boolean;
  onClick?: () => void;
}

export default function Card({ card, playable = false, small = false, large = false, onClick }: CardProps) {
  const pal = card.color ? PAL[card.color] : null;
  const { w, h, r, bw } = dims(small, large);
  const imgPath = getCardImagePath(card);

  const containerStyle: React.CSSProperties = {
    width: w,
    height: h,
    borderRadius: r,
    border: `${bw}px solid ${pal?.border || '#999'}`,
    backgroundColor: '#FFFFFF',
    boxShadow: playable
      ? `0 -6px 0 0 rgba(255,255,255,0.12), 0 4px 14px rgba(0,0,0,0.35), 0 0 12px ${pal?.main || '#9C27B0'}44`
      : '0 2px 6px rgba(0,0,0,0.18)',
    cursor: playable ? 'pointer' : 'default',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    transition: 'transform 0.15s, box-shadow 0.15s',
    transform: playable ? 'translateY(-8px)' : 'none',
    flexShrink: 0,
    userSelect: 'none' as const,
  };

  /* ── Image-based card ──────────────────────────────────── */
  if (imgPath) {
    return (
      <div onClick={playable ? onClick : undefined} style={{
        ...containerStyle,
        border: 'none',
        backgroundColor: 'transparent',
      }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imgPath}
          alt={`${card.color || ''} ${card.type} ${card.value ?? ''}`}
          draggable={false}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            borderRadius: r,
            pointerEvents: 'none',
          }}
        />
      </div>
    );
  }

  /* ── CSS fallback (number 2 only) ──────────────────────── */
  const { fs, depth } = dims(small, large);
  const textColor = pal?.main || '#9C27B0';
  const shadowBase = pal?.deep || 'rgba(0,0,0,0.3)';

  return (
    <div onClick={playable ? onClick : undefined} style={containerStyle}>
      {!small && (
        <span style={{
          position: 'absolute',
          top: 2,
          left: 3,
          fontSize: small ? 8 : large ? 15 : 11,
          color: textColor,
          fontWeight: 900,
          fontFamily: "'Arial Black', 'Impact', sans-serif",
        }}>
          {card.value}
        </span>
      )}
      <span style={{
        fontWeight: 900,
        fontFamily: "'Arial Black', 'Impact', sans-serif",
        lineHeight: 1,
        fontSize: fs,
        color: textColor,
        textShadow: extrude(shadowBase, depth),
      }}>
        {card.value}
      </span>
      {!small && (
        <span style={{
          position: 'absolute',
          bottom: 2,
          right: 3,
          fontSize: small ? 8 : large ? 15 : 11,
          color: textColor,
          fontWeight: 900,
          fontFamily: "'Arial Black', 'Impact', sans-serif",
          transform: 'rotate(180deg)',
        }}>
          {card.value}
        </span>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   CARD BACK — real PNG asset
   ════════════════════════════════════════════════════════════ */
export function CardBack({ small = false, large = false }: { small?: boolean; large?: boolean }) {
  const { w, h, r } = dims(small, large);

  return (
    <div style={{
      width: w,
      height: h,
      borderRadius: r,
      overflow: 'hidden',
      position: 'relative',
      boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
      backgroundColor: 'transparent',
      flexShrink: 0,
    }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/cards/card_back.png"
        alt="Card back"
        draggable={false}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          borderRadius: r,
          pointerEvents: 'none',
        }}
      />
    </div>
  );
}
