import { useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { CATEGORY_MAP } from '../data/categories';
import { shareResult } from '../lib/shareUtils';
import { useGameContext } from '../context/GameContext';
import { BingoCard } from './BingoCard';
import { Button } from './ui/Button';

export function WinScreen() {
  const { state, resetGame, goHome } = useGameContext();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Fire confetti exactly once on mount; clean up canvas on unmount (M-9 fix)
  useEffect(() => {
    const canvas = document.createElement('canvas');
    canvas.style.cssText =
      'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:999;';
    document.body.appendChild(canvas);
    canvasRef.current = canvas;

    const fire = confetti.create(canvas, { resize: true });
    fire({ particleCount: 150, spread: 80, origin: { y: 0.6 } });

    return () => { canvas.remove(); canvasRef.current = null; };
  }, []);

  const handlePlayAgain = () => {
    canvasRef.current?.remove();
    canvasRef.current = null;
    resetGame();
  };

  const elapsed =
    state.startedAt && state.completedAt
      ? Math.round((state.completedAt - state.startedAt) / 60_000)
      : null;

  const categoryName = state.category ? (CATEGORY_MAP[state.category]?.name ?? state.category) : '';
  const userFilled = Math.max(0, state.filledCount - 1);

  return (
    <div className="mx-auto min-h-screen max-w-xl px-4 py-10">
      <div className="mb-6 text-center">
        <h1 className="text-5xl font-bold text-green-600">BINGO!</h1>
        <p className="mt-1 text-gray-500 dark:text-gray-400">You got it! 🎉</p>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 gap-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        {elapsed !== null && (
          <Stat label="Time to BINGO" value={`${elapsed} min`} />
        )}
        {state.winningWord && (
          <Stat label="Winning word" value={`"${state.winningWord}"`} />
        )}
        <Stat label="Squares filled" value={`${userFilled}/24`} />
        {categoryName && <Stat label="Category" value={categoryName} />}
      </div>

      {/* Final card — read-only */}
      {state.card && (
        <div className="mb-6">
          <BingoCard
            card={state.card}
            winningLine={state.winningLine}
            onSquareClick={() => undefined}
          />
        </div>
      )}

      <div className="space-y-2">
        <Button
          variant="secondary"
          className="w-full"
          onClick={() => void shareResult(state)}
        >
          📋 Share Result
        </Button>
        <Button variant="primary" className="w-full" onClick={handlePlayAgain}>
          Play Again
        </Button>
        <Button variant="ghost" className="w-full" onClick={goHome}>
          Back to Home
        </Button>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <p className="text-xs text-gray-400 dark:text-gray-500">{label}</p>
      <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{value}</p>
    </div>
  );
}
