import { useCallback, useEffect, useMemo, useState } from 'react';
import type { GameState, Toast } from '../types';
import { getClosestToWin } from '../lib/bingoChecker';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { useBingoDetection } from '../hooks/useBingoDetection';
import { BingoCard } from './BingoCard';
import { TranscriptPanel } from './TranscriptPanel';
import { GameControls } from './GameControls';
import { ToastStack } from './ui/Toast';

interface Props {
  game: GameState;
  fillSquare: (row: number, col: number) => void;
  onNewCard: () => void;
}

export function GameBoard({ game, fillSquare, onNewCard }: Props) {
  const { isSupported, isListening, transcript, interimTranscript, startListening, stopListening } =
    useSpeechRecognition();

  const filledWords = useMemo(
    () =>
      game.card?.squares
        .flat()
        .filter(sq => sq.isFilled && !sq.isFreeSpace)
        .map(sq => sq.word) ?? [],
    [game.card],
  );

  const { lastDetected } = useBingoDetection({
    transcript,
    card: game.card,
    filledWords,
    fillSquare,
  });

  const [toasts, setToasts] = useState<Toast[]>([]);

  // Batch one toast per transcript segment (C-6 fix)
  useEffect(() => {
    if (lastDetected.length === 0) return;
    setToasts(prev => [
      ...prev.slice(-2),
      {
        id: `${Date.now()}`,
        message: `Detected: ${lastDetected.join(', ')}`,
        type: 'success',
        duration: 3000,
      },
    ]);
  }, [lastDetected]);

  const handleToggleListening = useCallback(() => {
    if (isListening) stopListening();
    else startListening();
  }, [isListening, startListening, stopListening]);

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const hint = game.card ? getClosestToWin(game.card) : null;
  const userFilled = Math.max(0, game.filledCount - 1);

  return (
    <div className="mx-auto min-h-screen max-w-xl bg-gray-50 px-4 py-6">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-blue-600">Meeting Bingo</h1>
        <div className="flex items-center gap-3">
          {isListening && (
            <span className="flex items-center gap-1.5 text-sm font-medium text-green-600">
              <span className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
              Listening…
            </span>
          )}
          <span className="text-sm text-gray-500">{userFilled}/24 squares</span>
        </div>
      </div>

      {/* Card */}
      {game.card && (
        <BingoCard
          card={game.card}
          winningLine={game.winningLine}
          onSquareClick={fillSquare}
        />
      )}

      {/* Near-bingo hint */}
      {hint?.needed === 1 && hint.nextWord && (
        <div className="mt-3 rounded-lg bg-amber-50 py-2 text-center text-sm font-medium text-amber-700">
          One away! Need: <strong>{hint.nextWord}</strong>
        </div>
      )}

      {/* Transcript */}
      <TranscriptPanel
        transcript={transcript}
        interimTranscript={interimTranscript}
        detectedWords={filledWords}
        isListening={isListening}
      />

      {/* Controls */}
      <GameControls
        isListening={isListening}
        isSupported={isSupported}
        filledCount={userFilled}
        onToggleListening={handleToggleListening}
        onNewCard={onNewCard}
      />

      <ToastStack toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
