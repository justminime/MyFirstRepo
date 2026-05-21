import { useGameContext } from '../context/GameContext';
import { CATEGORIES } from '../data/categories';
import { Button } from './ui/Button';

export function CategorySelect() {
  const { startGame, goHome } = useGameContext();

  return (
    <div className="mx-auto min-h-screen max-w-2xl px-4 py-10">
      <div className="mb-8 flex items-center gap-3">
        <button
          onClick={goHome}
          className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:text-gray-400 dark:hover:bg-gray-700"
          aria-label="Back to home"
        >
          ← Back
        </button>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Choose a Category</h1>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => startGame(cat.id)}
            className="flex flex-col items-center rounded-xl border-2 border-gray-200 bg-white p-6 text-center
              shadow-sm transition-all hover:border-blue-400 hover:shadow-md
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500
              active:scale-95 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-blue-500"
          >
            <span className="mb-2 text-4xl">{cat.icon}</span>
            <h2 className="mb-1 text-base font-semibold text-gray-800 dark:text-white">{cat.name}</h2>
            <p className="mb-3 text-xs text-gray-500 dark:text-gray-400">{cat.description}</p>
            <p className="mb-4 text-xs text-gray-400 dark:text-gray-500">
              {cat.words.slice(0, 4).join(', ')}…
            </p>
            <Button variant="primary" className="w-full" tabIndex={-1}>
              Select
            </Button>
          </button>
        ))}
      </div>
    </div>
  );
}
