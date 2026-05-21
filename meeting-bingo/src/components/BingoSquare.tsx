import { useEffect, useState } from 'react';
import { cn } from '../lib/utils';

interface Props {
  word: string;
  isFilled: boolean;
  isAutoFilled: boolean;
  isFreeSpace: boolean;
  isWinningSquare: boolean;
  onClick: () => void;
}

export function BingoSquare({ word, isFilled, isAutoFilled, isFreeSpace, isWinningSquare, onClick }: Props) {
  const [showPulse, setShowPulse] = useState(false);

  // Pulse for ~2 s after auto-fill then stop (M-5 fix)
  useEffect(() => {
    if (!isAutoFilled || !isFilled) { setShowPulse(false); return; }
    setShowPulse(true);
    const t = setTimeout(() => setShowPulse(false), 2000);
    return () => clearTimeout(t);
  }, [isAutoFilled, isFilled]);

  return (
    <button
      onClick={isFreeSpace ? undefined : onClick}
      tabIndex={isFreeSpace ? -1 : 0}
      aria-pressed={isFilled}
      aria-label={isFreeSpace ? 'Free space' : word}
      className={cn(
        'relative flex aspect-square min-h-[44px] items-center justify-center rounded-lg border-2 p-1',
        'text-center text-xs font-medium leading-tight transition-all duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500',
        'hover:scale-105 active:scale-95',
        // Default
        !isFilled && !isFreeSpace && 'border-gray-200 bg-white text-gray-700 hover:border-blue-400',
        // Filled (manual)
        isFilled && !isAutoFilled && !isFreeSpace && !isWinningSquare && 'border-blue-600 bg-blue-500 text-white',
        // Auto-filled
        isAutoFilled && isFilled && !isWinningSquare && 'border-blue-600 bg-blue-500 text-white',
        showPulse && 'animate-pulse',
        // Free space
        isFreeSpace && 'cursor-default border-amber-300 bg-amber-100 text-amber-700',
        // Winning
        isWinningSquare && 'border-green-600 bg-green-400 text-white ring-2 ring-green-600',
      )}
    >
      <span className={cn('break-words', isFilled && !isFreeSpace && 'line-through opacity-90')}>
        {isFreeSpace ? '⭐ FREE' : word}
      </span>
    </button>
  );
}
