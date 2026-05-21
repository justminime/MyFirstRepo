import { useCallback, useMemo } from 'react';
import type { CategoryId, GameState, GameStatus } from '../types';
import { generateCard } from '../lib/cardGenerator';
import { checkForBingo, countFilled } from '../lib/bingoChecker';
import { useLocalStorage } from './useLocalStorage';

const STORAGE_KEY = 'meeting-bingo:game-state';

const VALID_STATUSES = new Set<GameStatus>(['idle', 'setup', 'playing', 'won']);
const VALID_CATEGORIES = new Set<CategoryId>(['agile', 'corporate', 'tech', 'gen-x']);

function sanitizeGameState(raw: unknown): GameState {
  if (!raw || typeof raw !== 'object') return INITIAL_STATE;
  const s = raw as Record<string, unknown>;
  if (!VALID_STATUSES.has(s['status'] as GameStatus)) return INITIAL_STATE;
  if (s['category'] !== null && !VALID_CATEGORIES.has(s['category'] as CategoryId)) return INITIAL_STATE;
  if (s['card'] !== null && s['card'] !== undefined) {
    const squares = (s['card'] as Record<string, unknown>)['squares'];
    if (
      !Array.isArray(squares) ||
      squares.length !== 5 ||
      !(squares as unknown[]).every(row => Array.isArray(row) && (row as unknown[]).length === 5)
    ) {
      return INITIAL_STATE;
    }
  }
  return raw as GameState;
}

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
  newCard: () => void;
  prepareGame: () => void;
  goHome: () => void;
}

export function useGame(): UseGameReturn {
  const [state, setState] = useLocalStorage<GameState>(STORAGE_KEY, INITIAL_STATE, sanitizeGameState);

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
      if (!categoryId) return { ...INITIAL_STATE };
      try {
        const card = generateCard(categoryId);
        return { ...INITIAL_STATE, status: 'setup', category: categoryId, card, filledCount: countFilled(card) };
      } catch {
        return { ...INITIAL_STATE };
      }
    });
  }, [setState]);

  const newCard = useCallback(() => {
    setState(prev => {
      if (!prev.category) return prev;
      try {
        const card = generateCard(prev.category);
        return { ...prev, card, winningLine: null, winningWord: null, status: 'playing' as const, startedAt: Date.now(), completedAt: null, filledCount: countFilled(card) };
      } catch {
        return { ...INITIAL_STATE };
      }
    });
  }, [setState]);

  const prepareGame = useCallback(() => {
    setState(prev => ({ ...prev, status: 'setup' as const }));
  }, [setState]);

  const goHome = useCallback(() => {
    setState({ ...INITIAL_STATE });
  }, [setState]);

  const value = useMemo(
    () => ({ state, startGame, fillSquare, resetGame, newCard, prepareGame, goHome }),
    [state, startGame, fillSquare, resetGame, newCard, prepareGame, goHome],
  );

  return value;
}
