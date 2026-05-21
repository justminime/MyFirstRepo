import { Button } from './ui/Button';

interface Props {
  isListening: boolean;
  isSupported: boolean;
  micError: string | null;
  filledCount: number;
  onToggleListening: () => void;
  onNewCard: () => void;
}

export function GameControls({ isListening, isSupported, micError, filledCount, onToggleListening, onNewCard }: Props) {
  const handleNewCard = () => {
    if (filledCount > 0) {
      if (!window.confirm('This will clear your current card. Continue?')) return;
    }
    onNewCard();
  };

  const micDenied = micError === 'not-allowed' || micError === 'service-not-allowed';

  return (
    <div className="mt-4 space-y-3">
      {!isSupported ? (
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-center text-sm text-amber-700">
          Speech recognition is not available in this browser. You can still play manually.
        </p>
      ) : micDenied ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-center text-sm text-red-700">
          Microphone access denied. You can still play manually by tapping squares.
        </p>
      ) : (
        <Button
          variant="primary"
          className="w-full"
          onClick={onToggleListening}
        >
          {isListening ? '⏹ Stop Listening' : '🎤 Start Listening'}
        </Button>
      )}

      <Button variant="secondary" className="w-full" onClick={handleNewCard}>
        New Card
      </Button>
    </div>
  );
}
