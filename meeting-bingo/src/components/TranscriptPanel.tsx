import { cn } from '../lib/utils';

interface Props {
  transcript: string;
  interimTranscript: string;
  detectedWords: string[];
  isListening: boolean;
}

export function TranscriptPanel({ transcript, interimTranscript, detectedWords, isListening }: Props) {
  const displayText = transcript.slice(-100);
  const recentWords = detectedWords.slice(-5);

  return (
    <div className="mt-4 rounded-lg bg-gray-100 p-3 dark:bg-gray-800">
      <div className="mb-2 flex items-center gap-2">
        <span
          className={cn(
            'h-2.5 w-2.5 rounded-full',
            isListening ? 'animate-pulse bg-red-500' : 'bg-gray-400',
          )}
        />
        <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
          {isListening ? 'Listening...' : 'Paused'}
        </span>
      </div>

      <div className="min-h-[36px] text-sm text-gray-700 dark:text-gray-200">
        <span>{displayText || (isListening ? 'Waiting for speech…' : '')}</span>
        {interimTranscript && (
          <em className="text-gray-400 dark:text-gray-500"> {interimTranscript}</em>
        )}
      </div>

      {recentWords.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1 border-t border-gray-200 pt-2 dark:border-gray-700">
          <span className="text-xs text-gray-500 dark:text-gray-400">Detected:</span>
          {recentWords.map((word, i) => (
            <span
              key={`${word}-${i}`}
              className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700 dark:bg-green-900/30 dark:text-green-300"
            >
              ✨ {word}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
