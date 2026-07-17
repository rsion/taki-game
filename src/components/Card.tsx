'use client';

import { Card as CardType, CardColor } from '@/lib/types';

const COLOR_MAP: Record<string, string> = {
  red: 'bg-red-600',
  blue: 'bg-blue-600',
  green: 'bg-green-600',
  yellow: 'bg-yellow-500',
};

const COLOR_BORDER: Record<string, string> = {
  red: 'border-red-400',
  blue: 'border-blue-400',
  green: 'border-green-400',
  yellow: 'border-yellow-300',
};

const LABEL_MAP: Record<string, string> = {
  taki: 'TAKI',
  plus: '+',
  stop: '🚫',
  change_direction: '🔄',
  draw_two: '+2',
  super_taki: 'S.TAKI',
  change_color: '🎨',
};

interface CardProps {
  card: CardType;
  playable?: boolean;
  small?: boolean;
  onClick?: () => void;
}

export default function Card({ card, playable = false, small = false, onClick }: CardProps) {
  const isWild = !card.color;
  const bgClass = isWild
    ? 'bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400'
    : COLOR_MAP[card.color!] || 'bg-gray-600';
  const borderClass = isWild
    ? 'border-purple-300'
    : COLOR_BORDER[card.color!] || 'border-gray-400';

  const label = card.type === 'number' ? String(card.value) : LABEL_MAP[card.type] || card.type;

  const sizeClass = small
    ? 'w-10 h-14 text-xs rounded-md'
    : 'w-16 h-24 sm:w-20 sm:h-28 text-sm sm:text-base rounded-xl';

  return (
    <div
      onClick={playable ? onClick : undefined}
      className={`
        ${sizeClass} ${bgClass} border-2 ${borderClass}
        flex flex-col items-center justify-center
        text-white font-bold shadow-lg select-none
        transition-all duration-150
        ${playable ? 'card-playable cursor-pointer ring-2 ring-white/40' : ''}
        ${!playable && onClick ? 'opacity-60' : ''}
        relative overflow-hidden
      `}
    >
      {/* Top-left corner */}
      {!small && (
        <span className="absolute top-1 left-1.5 text-[10px] sm:text-xs opacity-80">
          {label}
        </span>
      )}

      {/* Center label */}
      <span className={`${small ? 'text-sm' : 'text-lg sm:text-2xl'} font-black drop-shadow-md ${card.type === 'taki' || card.type === 'super_taki' ? 'text-[10px] sm:text-xs tracking-wider' : ''}`}>
        {label}
      </span>

      {/* Bottom-right corner */}
      {!small && (
        <span className="absolute bottom-1 right-1.5 text-[10px] sm:text-xs opacity-80 rotate-180">
          {label}
        </span>
      )}

      {/* Shine overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />
    </div>
  );
}

// Card back (face down)
export function CardBack({ small = false }: { small?: boolean }) {
  const sizeClass = small
    ? 'w-10 h-14 rounded-md'
    : 'w-16 h-24 sm:w-20 sm:h-28 rounded-xl';

  return (
    <div className={`${sizeClass} bg-gradient-to-br from-indigo-800 to-indigo-950 border-2 border-indigo-500 flex items-center justify-center shadow-lg`}>
      <div className="text-center">
        <span className="text-white font-black text-xs sm:text-sm tracking-widest opacity-80">TAKI</span>
      </div>
      <div className="absolute inset-1 border border-indigo-400/30 rounded-lg pointer-events-none" />
    </div>
  );
}
