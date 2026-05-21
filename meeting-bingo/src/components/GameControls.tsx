import { Button } from './ui/Button';

interface Props {
  isListening: boolean;
  isSupported: boolean;
  filledCount: number;
  onToggleListening: () => void;
  onNewCard: () => void;
}

export function GameControls({ isListening, isSupported, filledCount, onToggleListening, onNewCard }: Props) {
  const handleNewCard = () => {
    if (filledCount > 0) {
      if (!window.confirm('This will clear your current card. Continue?')) return;
    }
    onNewCard();
  };

  return (
    <div className="mt-4 space-y-3">
      {isSupported ? (
        <Button
          variant="primary"
          className="w-full"
          onClick={onToggleListening}
        >
          {isListening ? '⏹ Stop Listening' : '🎤 Start Listening'}
        </Button>
      ) : (
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-center text-sm text-amber-700">
          Speech recognition is not available in this browser. You can still play manually.
        </p>
      )}

      <Button variant="secondary" className="w-full" onClick={handleNewCard}>
        New Card
      </Button>
    </div>
  );
}
