import { Button } from './ui/Button';

const STEPS = [
  { icon: '🃏', text: 'Pick a buzzword category' },
  { icon: '🎤', text: 'Enable microphone for auto-detection' },
  { icon: '💼', text: 'Join your meeting and listen' },
  { icon: '✨', text: 'Watch squares fill automatically!' },
];

interface Props {
  onStart: () => void;
}

export function LandingPage({ onStart }: Props) {
  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-6 py-12 text-center">
      <h1 className="mb-2 text-4xl font-bold text-blue-600">Meeting Bingo</h1>
      <p className="mb-4 text-lg text-gray-500">Turn any meeting into a game.</p>

      {/* Privacy note — must be above the fold (UXR requirement) */}
      <p className="mb-6 rounded-lg bg-blue-50 px-4 py-2 text-sm text-blue-700">
        🔒 Audio processed locally. Never recorded.
      </p>

      <Button className="mb-10 px-8 py-3 text-base" onClick={onStart}>
        New Game
      </Button>

      <div className="w-full rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-400">
          How It Works
        </h2>
        <ol className="space-y-3 text-left">
          {STEPS.map((step, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="text-xl">{step.icon}</span>
              <span className="text-sm text-gray-600">
                <strong className="text-gray-800">Step {i + 1}:</strong> {step.text}
              </span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
