'use client';

import { Card as CardType } from '@/lib/types';

/* ════════════════════════════════════════════════════════════
   AUTHENTIC TAKI CARD DESIGN
   Based on the real Shafir Games Taki card deck:
   - Number cards: white bg, bold colored number with 3D extrusion, thin colored border
   - Action cards: full solid colored bg with white symbols
   - TAKI cards: colored bg, "TAKI" in rainbow letters on white badge
   - Card back: red crosshatch diamond pattern, white inner margin, "TAKI" center badge
   ════════════════════════════════════════════════════════════ */

/* ── Taki Color Palette (matched to real cards) ──────────── */
const PAL: Record<string, { main: string; dark: string; deep: string; border: string }> = {
  red:    { main: '#E32636', dark: '#B81E2C', deep: '#8B1621', border: '#C92030' },
  blue:   { main: '#1472B8', dark: '#105B93', deep: '#0C446E', border: '#1266A6' },
  green:  { main: '#39A845', dark: '#2E8637', deep: '#226429', border: '#32963D' },
  yellow: { main: '#FDD835', dark: '#CAAD2A', deep: '#978220', border: '#E5C330' },
};
const TAKI_RAINBOW = ['#E32636', '#1472B8', '#39A845', '#FDD835'];

/* ── Scoring ─────────────────────────────────────────────── */
export function cardPoints(card: CardType): number {
  if (card.type === 'number') return card.value ?? 0;
  if (card.type === 'change_color') return 20;
  if (card.type === 'super_taki') return 30;
  return 10;
}

/* ── Sizes ───────────────────────────────────────────────── */
function dims(small: boolean, large: boolean) {
  if (small) return { w: 50, h: 70, r: 5, bw: 2, fs: 30, cfs: 8, depth: 1, pad: 2 };
  if (large) return { w: 130, h: 182, r: 10, bw: 3, fs: 76, cfs: 15, depth: 4, pad: 6 };
  return { w: 90, h: 126, r: 8, bw: 2.5, fs: 52, cfs: 11, depth: 3, pad: 4 };
}

/* ── 3D text-shadow extrusion ────────────────────────────── */
function extrude(color: string, n: number): string {
  const parts: string[] = [];
  for (let i = 1; i <= n; i++) parts.push(`${i}px ${i}px 0 ${color}`);
  parts.push(`${n + 1}px ${n + 1}px ${n * 2}px rgba(0,0,0,0.25)`);
  return parts.join(', ');
}

/* ── SVG icons for action cards ──────────────────────────── */
function StopIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <circle cx="20" cy="20" r="17" stroke="white" strokeWidth="3.5" fill="none" />
      <line x1="8" y1="20" x2="32" y2="20" stroke="white" strokeWidth="3.5" strokeLinecap="round" />
    </svg>
  );
}

function ArrowsIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 44 40" fill="none">
      <path d="M6 16 L22 6 L22 12 L38 12 L38 20 L22 20 L22 26 Z" fill="white" />
      <path d="M38 24 L22 34 L22 28 L6 28 L6 20 L22 20 L22 14 Z" fill="white" opacity="0.7" />
    </svg>
  );
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
  const { w, h, r, bw, fs, cfs, depth, pad } = dims(small, large);

  const isColoredBg = ['taki', 'plus', 'stop', 'change_direction', 'draw_two'].includes(card.type);
  const isWild = !card.color;

  /* Card colors */
  const bgColor = isColoredBg ? (pal?.main || '#888') : isWild ? '#F5F0FA' : '#FFFFFF';
  const borderColor = isColoredBg ? (pal?.dark || '#666') : isWild ? '#9C27B0' : (pal?.border || '#CCC');
  const textColor = isColoredBg ? '#FFFFFF' : (pal?.main || '#9C27B0');
  const shadowBase = isColoredBg ? 'rgba(0,0,0,0.4)' : (pal?.deep || 'rgba(0,0,0,0.3)');

  const boldFont: React.CSSProperties = {
    fontWeight: 900,
    fontFamily: "'Arial Black', 'Impact', sans-serif",
    lineHeight: 1,
    letterSpacing: '-0.02em',
  };

  /* ── Render content ────────────────────────────────────── */
  let corner: string;
  let center: React.ReactNode;

  switch (card.type) {
    case 'number': {
      corner = String(card.value);
      center = (
        <span style={{
          ...boldFont,
          fontSize: fs,
          color: textColor,
          textShadow: extrude(shadowBase, depth),
        }}>
          {corner}
        </span>
      );
      break;
    }

    case 'draw_two': {
      corner = '+2';
      center = (
        <span style={{
          ...boldFont,
          fontSize: fs * 0.75,
          color: '#FFFFFF',
          textShadow: extrude('rgba(0,0,0,0.4)', depth),
        }}>
          +2
        </span>
      );
      break;
    }

    case 'taki': {
      corner = 'T';
      const sz = small ? 12 : large ? 30 : 20;
      const badgePad = small ? '1px 3px' : large ? '5px 10px' : '3px 6px';
      center = (
        <div style={{
          backgroundColor: 'rgba(255,255,255,0.93)',
          padding: badgePad,
          borderRadius: small ? 3 : large ? 8 : 5,
          boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
          display: 'flex',
          gap: small ? 0 : 1,
        }}>
          {'TAKI'.split('').map((l, i) => (
            <span key={i} style={{
              ...boldFont,
              fontSize: sz,
              color: TAKI_RAINBOW[i],
            }}>{l}</span>
          ))}
        </div>
      );
      break;
    }

    case 'super_taki': {
      corner = '★';
      const sz = small ? 9 : large ? 22 : 15;
      const badgePad = small ? '2px 3px' : large ? '6px 12px' : '4px 8px';
      center = (
        <div style={{
          backgroundColor: 'rgba(255,255,255,0.93)',
          padding: badgePad,
          borderRadius: small ? 3 : large ? 8 : 5,
          boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 0,
        }}>
          <span style={{ ...boldFont, fontSize: sz * 0.5, color: '#9C27B0', letterSpacing: 1 }}>SUPER</span>
          <div style={{ display: 'flex', gap: 0 }}>
            {'TAKI'.split('').map((l, i) => (
              <span key={i} style={{ ...boldFont, fontSize: sz, color: TAKI_RAINBOW[i] }}>{l}</span>
            ))}
          </div>
        </div>
      );
      break;
    }

    case 'plus': {
      corner = '+';
      center = (
        <span style={{
          ...boldFont,
          fontSize: fs * 1.1,
          color: '#FFFFFF',
          textShadow: extrude('rgba(0,0,0,0.4)', depth),
        }}>
          +
        </span>
      );
      break;
    }

    case 'stop': {
      corner = '⊘';
      const iconSz = small ? 24 : large ? 64 : 42;
      center = <StopIcon size={iconSz} />;
      break;
    }

    case 'change_direction': {
      corner = '⇄';
      const iconSz = small ? 24 : large ? 64 : 42;
      center = <ArrowsIcon size={iconSz} />;
      break;
    }

    case 'change_color': {
      corner = '★';
      const sq = small ? 12 : large ? 28 : 18;
      const gap = small ? 2 : large ? 4 : 3;
      center = (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap, padding: 2 }}>
          {Object.values(PAL).map((c, i) => (
            <div key={i} style={{
              width: sq, height: sq,
              backgroundColor: c.main,
              borderRadius: small ? 2 : 3,
              boxShadow: `1px 1px 0 ${c.dark}`,
            }} />
          ))}
        </div>
      );
      break;
    }

    default: {
      corner = '?';
      center = <span style={{ ...boldFont, fontSize: fs * 0.5, color: textColor }}>{card.type}</span>;
    }
  }

  return (
    <div
      onClick={playable ? onClick : undefined}
      style={{
        width: w,
        height: h,
        borderRadius: r,
        border: `${bw}px solid ${borderColor}`,
        backgroundColor: bgColor,
        boxShadow: playable
          ? `0 -6px 0 0 rgba(255,255,255,0.12), 0 4px 14px rgba(0,0,0,0.35), 0 0 12px ${pal?.main || '#9C27B0'}44`
          : '0 2px 6px rgba(0,0,0,0.18)',
        cursor: playable ? 'pointer' : 'default',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        transition: 'transform 0.15s, box-shadow 0.15s',
        transform: playable ? 'translateY(-8px)' : 'none',
        flexShrink: 0,
        userSelect: 'none' as const,
      }}
    >
      {/* Corner numbers */}
      {!small && (
        <span style={{
          position: 'absolute',
          top: pad,
          left: pad + 1,
          fontSize: cfs,
          color: textColor,
          ...boldFont,
        }}>
          {corner}
        </span>
      )}
      {center}
      {!small && (
        <span style={{
          position: 'absolute',
          bottom: pad,
          right: pad + 1,
          fontSize: cfs,
          color: textColor,
          ...boldFont,
          transform: 'rotate(180deg)',
        }}>
          {corner}
        </span>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   CARD BACK — authentic red crosshatch pattern
   Real Taki card back: dark red border → white inner margin →
   red diagonal lattice on cream bg → center "TAKI" badge
   ════════════════════════════════════════════════════════════ */
export function CardBack({ small = false, large = false }: { small?: boolean; large?: boolean }) {
  const { w, h, r } = dims(small, large);
  const stripe = small ? 4 : large ? 7 : 5;
  const margin = small ? 3 : large ? 6 : 4;
  const innerR = Math.max(r - 2, 2);

  return (
    <div style={{
      width: w,
      height: h,
      borderRadius: r,
      border: `${small ? 2 : 3}px solid #8B1621`,
      overflow: 'hidden',
      position: 'relative',
      boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
      backgroundColor: '#FFFDF5',
      flexShrink: 0,
    }}>
      {/* Crosshatch pattern area */}
      <div style={{
        position: 'absolute',
        inset: margin,
        borderRadius: innerR,
        overflow: 'hidden',
        background: `
          repeating-linear-gradient(
            45deg,
            transparent,
            transparent ${stripe}px,
            #D32F2F ${stripe}px,
            #D32F2F ${stripe + 1.2}px
          ),
          repeating-linear-gradient(
            -45deg,
            transparent,
            transparent ${stripe}px,
            #D32F2F ${stripe}px,
            #D32F2F ${stripe + 1.2}px
          )
        `,
        backgroundColor: '#FFF5F0',
      }} />

      {/* Center TAKI badge */}
      <div style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{
          backgroundColor: '#FFFFFF',
          padding: small ? '2px 4px' : large ? '6px 14px' : '3px 8px',
          borderRadius: small ? 3 : large ? 8 : 5,
          boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
          border: '1px solid rgba(0,0,0,0.08)',
          display: 'flex',
          gap: small ? 0 : 1,
        }}>
          {'TAKI'.split('').map((l, i) => (
            <span key={i} style={{
              fontWeight: 900,
              fontFamily: "'Arial Black', 'Impact', sans-serif",
              fontSize: small ? 7 : large ? 20 : 12,
              color: TAKI_RAINBOW[i],
            }}>{l}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
