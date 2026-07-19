'use client';

import { Card as CardType } from '@/lib/types';

const COLOR_HEX: Record<string, string> = {
  red: '#E53935',
  blue: '#1E88E5',
  green: '#43A047',
  yellow: '#F9A825',
};

const COLOR_LIGHT: Record<string, string> = {
  red: '#FFCDD2',
  blue: '#BBDEFB',
  green: '#C8E6C9',
  yellow: '#FFF9C4',
};

const COLOR_DARK: Record<string, string> = {
  red: '#B71C1C',
  blue: '#0D47A1',
  green: '#1B5E20',
  yellow: '#F57F17',
};

function getActionSymbol(type: string): { label: string; fontSize: string } {
  switch (type) {
    case 'taki':
      return { label: 'TAKI', fontSize: 'text-2xl sm:text-3xl' };
    case 'super_taki':
      return { label: 'TAKI', fontSize: 'text-xl sm:text-2xl' };
    case 'plus':
      return { label: '+', fontSize: 'text-5xl sm:text-6xl' };
    case 'stop':
      return { label: '✋', fontSize: 'text-4xl sm:text-5xl' };
    case 'change_direction':
      return { label: '⇄', fontSize: 'text-4xl sm:text-5xl' };
    case 'draw_two':
      return { label: '+2', fontSize: 'text-3xl sm:text-4xl' };
    case 'change_color':
      return { label: '🎨', fontSize: 'text-4xl sm:text-5xl' };
    default:
      return { label: '?', fontSize: 'text-3xl' };
  }
}

interface CardProps {
  card: CardType;
  playable?: boolean;
  small?: boolean;
  large?: boolean;
  onClick?: () => void;
}

export default function Card({ card, playable = false, small = false, large = false, onClick }: CardProps) {
  const color = card.color;
  const isWild = !color;
  const hex = color ? COLOR_HEX[color] : '#7B1FA2';
  const lightHex = color ? COLOR_LIGHT[color] : '#E1BEE7';
  const darkHex = color ? COLOR_DARK[color] : '#4A148C';

  // Size classes
  const sizeClass = small
    ? 'w-[52px] h-[74px] rounded-lg'
    : large
    ? 'w-[120px] h-[170px] sm:w-[140px] sm:h-[196px] rounded-2xl'
    : 'w-[85px] h-[120px] sm:w-[100px] sm:h-[140px] rounded-xl';

  const cornerSize = small ? 'text-[8px]' : large ? 'text-base sm:text-lg' : 'text-[11px] sm:text-xs';

  // Build the center content
  let centerContent: React.ReactNode;
  let cornerLabel: string;

  if (card.type === 'number') {
    const numStr = String(card.value);
    cornerLabel = numStr;
    centerContent = (
      <span
        className={`font-black leading-none ${small ? 'text-2xl' : large ? 'text-7xl sm:text-8xl' : 'text-4xl sm:text-5xl'}`}
        style={{
          color: hex,
          textShadow: `2px 2px 0 ${darkHex}, -1px -1px 0 ${lightHex}, 3px 3px 6px rgba(0,0,0,0.15)`,
          fontFamily: "'Arial Black', 'Impact', sans-serif",
        }}
      >
        {numStr}
      </span>
    );
  } else if (card.type === 'taki') {
    cornerLabel = 'TAKI';
    const { fontSize } = getActionSymbol('taki');
    centerContent = (
      <div className="flex flex-col items-center">
        <span
          className={`font-black tracking-tight leading-none ${small ? 'text-[10px]' : fontSize}`}
          style={{
            color: hex,
            textShadow: `1px 1px 0 ${darkHex}, 2px 2px 4px rgba(0,0,0,0.2)`,
            fontFamily: "'Arial Black', 'Impact', sans-serif",
          }}
        >
          TA
        </span>
        <span
          className={`font-black tracking-tight leading-none ${small ? 'text-[10px]' : fontSize}`}
          style={{
            color: hex,
            textShadow: `1px 1px 0 ${darkHex}, 2px 2px 4px rgba(0,0,0,0.2)`,
            fontFamily: "'Arial Black', 'Impact', sans-serif",
          }}
        >
          KI
        </span>
      </div>
    );
  } else if (card.type === 'super_taki') {
    cornerLabel = '★';
    centerContent = (
      <div className="flex flex-col items-center">
        <div className={`flex ${small ? 'text-[8px]' : 'text-lg sm:text-xl'}`} style={{ fontFamily: "'Arial Black', 'Impact', sans-serif" }}>
          <span style={{ color: '#E53935', filter: 'drop-shadow(1px 1px 1px rgba(0,0,0,0.3))' }} className="font-black">T</span>
          <span style={{ color: '#F9A825', filter: 'drop-shadow(1px 1px 1px rgba(0,0,0,0.3))' }} className="font-black">A</span>
        </div>
        <div className={`flex ${small ? 'text-[8px]' : 'text-lg sm:text-xl'}`} style={{ fontFamily: "'Arial Black', 'Impact', sans-serif" }}>
          <span style={{ color: '#43A047', filter: 'drop-shadow(1px 1px 1px rgba(0,0,0,0.3))' }} className="font-black">K</span>
          <span style={{ color: '#1E88E5', filter: 'drop-shadow(1px 1px 1px rgba(0,0,0,0.3))' }} className="font-black">I</span>
        </div>
      </div>
    );
  } else if (card.type === 'change_color') {
    cornerLabel = '🎨';
    centerContent = (
      <div className={`grid grid-cols-2 ${small ? 'gap-0.5' : 'gap-1'}`}>
        {['#E53935', '#1E88E5', '#43A047', '#F9A825'].map((c, i) => (
          <div
            key={i}
            className={`${small ? 'w-2.5 h-2.5' : large ? 'w-7 h-7' : 'w-5 h-5'} rounded-sm shadow-sm`}
            style={{ backgroundColor: c }}
          />
        ))}
      </div>
    );
  } else {
    const { label, fontSize } = getActionSymbol(card.type);
    cornerLabel = label;
    centerContent = (
      <span
        className={`font-black leading-none ${small ? 'text-base' : fontSize}`}
        style={{
          color: hex,
          textShadow: isWild ? '1px 1px 2px rgba(0,0,0,0.3)' : `1px 1px 0 ${darkHex}`,
          fontFamily: "'Arial Black', 'Impact', sans-serif",
        }}
      >
        {label}
      </span>
    );
  }

  // Wild card background
  const bgStyle = isWild
    ? { background: 'linear-gradient(135deg, #f3e5f5 0%, #e1bee7 50%, #ce93d8 100%)' }
    : { backgroundColor: '#FFFFFF' };

  const borderColor = isWild ? '#9C27B0' : hex;

  return (
    <div
      onClick={playable ? onClick : undefined}
      className={`
        ${sizeClass}
        flex flex-col items-center justify-center
        font-bold select-none relative overflow-hidden
        transition-all duration-150
        ${playable ? 'card-playable cursor-pointer' : ''}
      `}
      style={{
        ...bgStyle,
        border: `${small ? '2px' : '3px'} solid ${borderColor}`,
        boxShadow: playable
          ? `0 0 12px ${hex}88, 0 4px 12px rgba(0,0,0,0.3)`
          : '0 2px 8px rgba(0,0,0,0.2)',
      }}
    >
      {/* Top-left corner */}
      {!small && (
        <span
          className={`absolute ${large ? 'top-2 left-2.5' : 'top-1 left-1.5'} ${cornerSize} font-black`}
          style={{ color: hex }}
        >
          {cornerLabel}
        </span>
      )}

      {/* Center content */}
      {centerContent}

      {/* Bottom-right corner (rotated) */}
      {!small && (
        <span
          className={`absolute ${large ? 'bottom-2 right-2.5' : 'bottom-1 right-1.5'} ${cornerSize} font-black rotate-180`}
          style={{ color: hex }}
        >
          {cornerLabel}
        </span>
      )}
    </div>
  );
}

// Card back (face down)
export function CardBack({ small = false, large = false }: { small?: boolean; large?: boolean }) {
  const sizeClass = small
    ? 'w-[52px] h-[74px] rounded-lg'
    : large
    ? 'w-[120px] h-[170px] sm:w-[140px] sm:h-[196px] rounded-2xl'
    : 'w-[85px] h-[120px] sm:w-[100px] sm:h-[140px] rounded-xl';

  return (
    <div
      className={`${sizeClass} flex items-center justify-center relative overflow-hidden`}
      style={{
        background: 'linear-gradient(135deg, #1565C0 0%, #0D47A1 50%, #1A237E 100%)',
        border: '3px solid #1565C0',
        boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
      }}
    >
      {/* Inner border */}
      <div
        className="absolute inset-2 rounded-lg border-2 border-white/30"
        style={{ borderStyle: 'dashed' }}
      />
      <div className="text-center flex items-center">
        <span style={{ color: '#E53935', fontFamily: "'Arial Black', 'Impact', sans-serif" }}
          className={`font-black ${small ? 'text-[8px]' : large ? 'text-2xl' : 'text-sm sm:text-base'}`}>T</span>
        <span style={{ color: '#F9A825', fontFamily: "'Arial Black', 'Impact', sans-serif" }}
          className={`font-black ${small ? 'text-[8px]' : large ? 'text-2xl' : 'text-sm sm:text-base'}`}>A</span>
        <span style={{ color: '#43A047', fontFamily: "'Arial Black', 'Impact', sans-serif" }}
          className={`font-black ${small ? 'text-[8px]' : large ? 'text-2xl' : 'text-sm sm:text-base'}`}>K</span>
        <span style={{ color: '#1E88E5', fontFamily: "'Arial Black', 'Impact', sans-serif" }}
          className={`font-black ${small ? 'text-[8px]' : large ? 'text-2xl' : 'text-sm sm:text-base'}`}>I</span>
      </div>
    </div>
  );
}
