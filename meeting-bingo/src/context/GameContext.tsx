import { createContext, useContext, type ReactNode } from 'react';
import { useGame, type UseGameReturn } from '../hooks/useGame';

const GameContext = createContext<UseGameReturn | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const game = useGame();
  return <GameContext.Provider value={game}>{children}</GameContext.Provider>;
}

export function useGameContext(): UseGameReturn {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGameContext must be used inside GameProvider');
  return ctx;
}
