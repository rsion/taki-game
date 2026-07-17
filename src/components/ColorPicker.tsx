'use client';

import { CardColor } from '@/lib/types';

const COLORS: { color: CardColor; label: string; bg: string; ring: string }[] = [
  { color: 'red', label: 'Red', bg: 'bg-red-600 hover:bg-red-500', ring: 'ring-red-400' },
  { color: 'blue', label: 'Blue', bg: 'bg-blue-600 hover:bg-blue-500', ring: 'ring-blue-400' },
  { color: 'green', label: 'Green', bg: 'bg-green-600 hover:bg-green-500', ring: 'ring-green-400' },
  { color: 'yellow', label: 'Yellow', bg: 'bg-yellow-500 hover:bg-yellow-400', ring: 'ring-yellow-300' },
];

interface ColorPickerProps {
  onChoose: (color: CardColor) => void;
  onCancel: () => void;
}

export default function ColorPicker({ onChoose, onCancel }: ColorPickerProps) {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-gray-900/95 rounded-2xl p-6 shadow-2xl border border-white/20 max-w-xs w-full mx-4">
        <h3 className="text-white text-lg font-bold text-center mb-4">Choose a Color</h3>
        <div className="grid grid-cols-2 gap-3">
          {COLORS.map(({ color, label, bg, ring }) => (
            <button
              key={color}
              onClick={() => onChoose(color)}
              className={`${bg} text-white font-bold py-4 rounded-xl transition-all hover:scale-105 active:scale-95 ring-2 ${ring} shadow-lg`}
            >
              {label}
            </button>
          ))}
        </div>
        <button
          onClick={onCancel}
          className="w-full mt-4 py-2 text-white/50 hover:text-white/80 transition-colors text-sm"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
