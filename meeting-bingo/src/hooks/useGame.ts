import { useCallback, useMemo } from 'react';
import type { CategoryId, GameState } from '../types';
import { generateCard } from '../lib/cardGenerator';
import { checkForBingo, countFilled } from '../lib/bingoChecker';
import { useLocalStorage } from './useLocalStorage';

const STORAGE_KEY = 'meeting-bingo:game-state';

const INITIAL_STATE: GameState = {
  status: 'idle',
  category: null,
  card: null,
  isListening: false,
  startedAt: null,
  completedAt: null,
  winningLine: null,
  winningWord: null,
  filledCount: 0,
};

export interface UseGameReturn {
  state: GameState;
  startGame: (categoryId: CategoryId) => void;
  fillSquare: (row: number, col: number) => void;
  resetGame: () => void;
}

export function useGame(): UseGameReturn {
  const [state, setState] = useLocalStorage<GameState>(STORAGE_KEY, INITIAL_STATE);

  const startGame = useCallback((categoryId: CategoryId) => {
    const card = generateCard(categoryId);
    setState({
      ...INITIAL_STATE,
      status: 'playing',
      category: categoryId,
      card,
      startedAt: Date.now(),
      filledCount: countFilled(card),
    });
  }, [setState]);

  const fillSquare = useCallback((row: number, col: number) => {
    setState(prev => {
      if (!prev.card || prev.status !== 'playing') return prev;

      const square = prev.card.squares[row]?.[col];
      if (!square) return prev;

      // Toggle off only manually-filled squares; auto-filled and winning squares are permanent
      if (square.isFilled) {
        if (square.isFreeSpace || square.isAutoFilled) return prev;
        const winningIds = new Set(prev.winningLine?.squares ?? []);
        if (winningIds.has(square.id)) return prev;
      }

      const newSquares = prev.card.squares.map((r, ri) =>
        r.map((sq, ci) => {
          if (ri !== row || ci !== col) return sq;
          return {
            ...sq,
            isFilled: !sq.isFilled,
            filledAt: !sq.isFilled ? Date.now() : null,
          };
        }),
      );

      const newCard = { ...prev.card, squares: newSquares };
      const winningLine = checkForBingo(newCard);
      const filledCount = countFilled(newCard);

      if (winningLine) {
        const winningSquareId = winningLine.squares.find(id => {
          const [r, c] = id.split('-').map(Number);
          return newSquares[r ?? 0]?.[c ?? 0]?.isFilled &&
            !newSquares[r ?? 0]?.[c ?? 0]?.isFreeSpace;
        });
        const winningWord = winningSquareId
          ? (() => {
              const [r, c] = winningSquareId.split('-').map(Number);
              return newSquares[r ?? 0]?.[c ?? 0]?.word ?? null;
            })()
          : null;

        return {
          ...prev,
          card: newCard,
          status: 'won',
          completedAt: Date.now(),
          winningLine,
          winningWord,
          filledCount,
        };
      }

      return { ...prev, card: newCard, filledCount };
    });
  }, [setState]);

  const resetGame = useCallback(() => {
    setState(prev => {
      const categoryId = prev.category;
      if (!categoryId) {
        return { ...INITIAL_STATE };
      }
      const card = generateCard(categoryId);
      return {
        ...INITIAL_STATE,
        status: 'setup',
        category: categoryId,
        card,
        filledCount: countFilled(card),
      };
    });
  }, [setState]);

  const value = useMemo(
    () => ({ state, startGame, fillSquare, resetGame }),
    [state, startGame, fillSquare, resetGame],
  );

  return value;
}
