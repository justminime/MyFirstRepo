import { useEffect, useRef, useState } from 'react';
import type { BingoCard } from '../types';
import { detectWordsWithAliases } from '../lib/wordDetector';

const DEBOUNCE_MS = 250;

interface UseBingoDetectionOptions {
  transcript: string;
  card: BingoCard | null;
  filledWords: string[];
  fillSquare: (row: number, col: number) => void;
}

export function useBingoDetection({
  transcript,
  card,
  filledWords,
  fillSquare,
}: UseBingoDetectionOptions): { lastDetected: string[] } {
  const [lastDetected, setLastDetected] = useState<string[]>([]);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevTranscriptRef = useRef('');

  useEffect(() => {
    if (!card || transcript === prevTranscriptRef.current) return;

    const segment = transcript.slice(prevTranscriptRef.current.length);
    prevTranscriptRef.current = transcript;

    if (!segment.trim()) return;

    if (timerRef.current !== null) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      const alreadyFilled = new Set(filledWords.map(w => w.toLowerCase()));
      const cardWords = card.words;
      const detected = detectWordsWithAliases(segment, cardWords, alreadyFilled);

      if (detected.length === 0) return;

      for (const word of detected) {
        for (let r = 0; r < card.squares.length; r++) {
          const row = card.squares[r];
          if (!row) continue;
          for (let c = 0; c < row.length; c++) {
            const sq = row[c];
            if (sq && sq.word.toLowerCase() === word.toLowerCase() && !sq.isFilled) {
              fillSquare(r, c);
            }
          }
        }
      }

      setLastDetected(detected);
    }, DEBOUNCE_MS);

    return () => {
      if (timerRef.current !== null) clearTimeout(timerRef.current);
    };
  }, [transcript, card, filledWords, fillSquare]);

  return { lastDetected };
}
