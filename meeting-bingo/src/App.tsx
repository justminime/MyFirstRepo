import { useGameContext } from './context/GameContext';
import { useTheme } from './hooks/useTheme';
import { LandingPage } from './components/LandingPage';
import { CategorySelect } from './components/CategorySelect';
import { GameBoard } from './components/GameBoard';
import { WinScreen } from './components/WinScreen';

export default function App() {
  const { state } = useGameContext();
  const { theme, toggleTheme } = useTheme();

  function renderScreen() {
    if (state.status === 'idle') return <LandingPage />;
    if (state.status === 'setup') return <CategorySelect />;
    if (state.status === 'playing') return <GameBoard />;
    if (state.status === 'won') return <WinScreen />;
    const _exhaustive: never = state.status;
    return _exhaustive;
  }

  return (
    <>
      <button
        onClick={toggleTheme}
        className="fixed right-4 top-4 z-50 rounded-full p-2 text-xl leading-none hover:bg-gray-100 dark:hover:bg-gray-800"
        aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {theme === 'dark' ? '☀️' : '🌙'}
      </button>
      {renderScreen()}
    </>
  );
}
