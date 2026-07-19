'use client';

import { Card as CardType } from '@/lib/types';

/* ── Palette ─────────────────────────────────────────────── */
const PAL: Record<string, { m: string; d: string; s: string }> = {
  red:    { m: '#C0392B', d: '#922B21', s: '#641E16' },
  blue:   { m: '#2980B9', d: '#1F618D', s: '#154360' },
  green:  { m: '#27AE60', d: '#1E8449', s: '#145A32' },
  yellow: { m: '#F1C40F', d: '#B7950B', s: '#7D6608' },
};
const WILD = { m: '#8E44AD', d: '#6C3483', s: '#4A235A' };
const TAKI_COLORS = ['#E74C3C', '#3498DB', '#2ECC71', '#F1C40F'];

/* ── Helpers ─────────────────────────────────────────────── */
function extrude(color: string, n: number) {
  const s: string[] = [];
  for (let i = 1; i <= n; i++) s.push(`${i}px ${i}px 0 ${color}`);
  s.push(`${n + 1}px ${n + 1}px ${n * 2}px rgba(0,0,0,0.22)`);
  return s.join(', ');
}

function cardPoints(card: CardType): number {
  if (card.type === 'number') return card.value ?? 0;
  if (card.type === 'change_color') return 20;
  if (card.type === 'super_taki') return 30;
  return 10;
}

export { cardPoints };

/* ── Sizes ───────────────────────────────────────────────── */
function dims(small: boolean, large: boolean) {
  if (small) return { w: 50, h: 70, r: 7, bw: 2, cFs: 24, crFs: 8, depth: 1, pad: 3 };
  if (large) return { w: 130, h: 182, r: 14, bw: 3, cFs: 68, crFs: 16, depth: 4, pad: 8 };
  return { w: 90, h: 126, r: 10, bw: 2.5, cFs: 44, crFs: 11, depth: 3, pad: 5 };
}

/* ── Card props ──────────────────────────────────────────── */
interface CardProps {
  card: CardType;
  playable?: boolean;
  small?: boolean;
  large?: boolean;
  onClick?: () => void;
}

export default function Card({ card, playable = false, small = false, large = false, onClick }: CardProps) {
  const p = card.color ? PAL[card.color] : WILD;
  const { w, h, r, bw, cFs, crFs, depth, pad } = dims(small, large);
  const isWild = !card.color;

  /* Determine background: TAKI/Plus/Stop cards get colored bg */
  const coloredBg = ['taki', 'plus', 'stop', 'change_direction'].includes(card.type);
  const bg = coloredBg ? p.m : isWild ? '#EDE7F6' : '#FEFEFE';
  const txt = coloredBg ? '#FFF' : p.m;
  const shadowColor = coloredBg ? 'rgba(0,0,0,0.35)' : p.s;

  const font: React.CSSProperties = {
    fontWeight: 900,
    fontFamily: "'Arial Black', 'Impact', sans-serif",
    lineHeight: 1,
  };

  /* ── Corner + center ───────────────────────────────────── */
  let corner: string;
  let center: React.ReactNode;

  if (card.type === 'number') {
    corner = String(card.value);
    center = (
      <span style={{ ...font, fontSize: cFs, color: txt, textShadow: extrude(shadowColor, depth) }}>
        {corner}
      </span>
    );
  } else if (card.type === 'draw_two') {
    corner = '+2';
    center = (
      <span style={{ ...font, fontSize: cFs * 0.85, color: txt, textShadow: extrude(shadowColor, depth) }}>
        +2
      </span>
    );
  } else if (card.type === 'taki') {
    corner = 'T';
    const sz = small ? 11 : large ? 28 : 19;
    center = (
      <div style={{ display: 'flex', gap: 1 }}>
        {'TAKI'.split('').map((l, i) => (
          <span key={i} style={{ ...font, fontSize: sz, color: TAKI_COLORS[i], textShadow: '1px 1px 0 rgba(0,0,0,0.4), 2px 2px 3px rgba(0,0,0,0.2)' }}>{l}</span>
        ))}
      </div>
    );
  } else if (card.type === 'super_taki') {
    corner = '★';
    const sz = small ? 9 : large ? 22 : 15;
    center = (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
        <span style={{ ...font, fontSize: sz * 0.55, color: '#9B59B6', letterSpacing: 1 }}>SUPER</span>
        <div style={{ display: 'flex', gap: 1 }}>
          {'TAKI'.split('').map((l, i) => (
            <span key={i} style={{ ...font, fontSize: sz, color: TAKI_COLORS[i], textShadow: '1px 1px 0 rgba(0,0,0,0.4)' }}>{l}</span>
          ))}
        </div>
      </div>
    );
  } else if (card.type === 'plus') {
    corner = '+';
    center = (
      <span style={{ ...font, fontSize: cFs * 1.15, color: '#FFF', textShadow: extrude('rgba(0,0,0,0.35)', depth) }}>
        +
      </span>
    );
  } else if (card.type === 'stop') {
    corner = '✋';
    center = (
      <span style={{ fontSize: small ? 20 : large ? 60 : 40, filter: 'drop-shadow(2px 2px 2px rgba(0,0,0,0.3))' }}>
        🤚
      </span>
    );
  } else if (card.type === 'change_direction') {
    corner = '⇄';
    center = (
      <span style={{ ...font, fontSize: cFs * 0.9, color: '#FFF', textShadow: extrude('rgba(0,0,0,0.35)', depth) }}>
        ⇄
      </span>
    );
  } else if (card.type === 'change_color') {
    corner = '★';
    const sq = small ? 10 : large ? 26 : 18;
    center = (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: small ? 2 : large ? 5 : 3 }}>
        {Object.values(PAL).map((c, i) => (
          <div key={i} style={{ width: sq, height: sq, backgroundColor: c.m, borderRadius: 3, boxShadow: `1px 1px 0 ${c.d}` }} />
        ))}
      </div>
    );
  } else {
    corner = '?';
    center = <span style={{ ...font, fontSize: cFs, color: txt }}>{card.type}</span>;
  }

  return (
    <div
      onClick={playable ? onClick : undefined}
      style={{
        width: w, height: h, borderRadius: r,
        border: `${bw}px solid ${coloredBg ? p.d : isWild ? '#7B1FA2' : p.d}`,
        backgroundColor: bg,
        boxShadow: playable
          ? `0 -6px 0 0 rgba(255,255,255,0.15), 0 4px 14px rgba(0,0,0,0.35), 0 0 16px ${p.m}55`
          : '0 2px 6px rgba(0,0,0,0.18)',
        cursor: playable ? 'pointer' : 'default',
        position: 'relative',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden',
        transition: 'transform 0.15s, box-shadow 0.15s',
        transform: playable ? 'translateY(-8px)' : 'none',
        flexShrink: 0, userSelect: 'none' as const,
      }}
    >
      {!small && (
        <span style={{ position: 'absolute', top: pad, left: pad + 1, fontSize: crFs, color: txt, ...font }}>{corner}</span>
      )}
      {center}
      {!small && (
        <span style={{ position: 'absolute', bottom: pad, right: pad + 1, fontSize: crFs, color: txt, ...font, transform: 'rotate(180deg)' }}>{corner}</span>
      )}
    </div>
  );
}

/* ── Card Back ───────────────────────────────────────────── */
export function CardBack({ small = false, large = false }: { small?: boolean; large?: boolean }) {
  const { w, h, r } = dims(small, large);
  const stripe = small ? 5 : large ? 9 : 7;

  return (
    <div style={{
      width: w, height: h, borderRadius: r,
      border: '2.5px solid #444',
      overflow: 'hidden', position: 'relative',
      boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
      flexShrink: 0,
    }}>
      {/* Crosshatch pattern */}
      <div style={{
        position: 'absolute',
        inset: small ? 3 : 5,
        borderRadius: r - 3,
        background: `
          repeating-linear-gradient(45deg, transparent, transparent ${stripe}px, #C0392B ${stripe}px, #C0392B ${stripe + 1.5}px),
          repeating-linear-gradient(-45deg, transparent, transparent ${stripe}px, #C0392B ${stripe}px, #C0392B ${stripe + 1.5}px)
        `,
        backgroundColor: '#FFF8F0',
      }} />
      {/* Center label */}
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{
          backgroundColor: 'rgba(255,255,255,0.92)',
          padding: small ? '1px 3px' : large ? '6px 12px' : '3px 7px',
          borderRadius: 4,
          boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
          display: 'flex', gap: 0,
        }}>
          {'TAKI'.split('').map((l, i) => (
            <span key={i} style={{
              fontWeight: 900,
              fontFamily: "'Arial Black', 'Impact', sans-serif",
              fontSize: small ? 7 : large ? 18 : 11,
              color: TAKI_COLORS[i],
            }}>{l}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
