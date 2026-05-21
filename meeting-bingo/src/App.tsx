import { useGame } from './hooks/useGame';
import { LandingPage } from './components/LandingPage';
import { CategorySelect } from './components/CategorySelect';
import { GameBoard } from './components/GameBoard';
import { WinScreen } from './components/WinScreen';

export default function App() {
  const { state, startGame, fillSquare, resetGame, newCard, prepareGame, goHome } = useGame();

  if (state.status === 'idle') {
    return <LandingPage onStart={prepareGame} />;
  }

  if (state.status === 'setup') {
    return <CategorySelect onSelect={startGame} onBack={goHome} />;
  }

  if (state.status === 'playing' && state.card) {
    return <GameBoard game={state} fillSquare={fillSquare} onNewCard={newCard} />;
  }

  if (state.status === 'won') {
    return <WinScreen game={state} onPlayAgain={resetGame} onHome={goHome} />;
  }

  return <LandingPage onStart={prepareGame} />;
}
