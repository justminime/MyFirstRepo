import { useGameContext } from './context/GameContext';
import { LandingPage } from './components/LandingPage';
import { CategorySelect } from './components/CategorySelect';
import { GameBoard } from './components/GameBoard';
import { WinScreen } from './components/WinScreen';

export default function App() {
  const { state } = useGameContext();

  if (state.status === 'idle') return <LandingPage />;
  if (state.status === 'setup') return <CategorySelect />;
  if (state.status === 'playing') return <GameBoard />;
  if (state.status === 'won') return <WinScreen />;

  const _exhaustive: never = state.status;
  return _exhaustive;
}
