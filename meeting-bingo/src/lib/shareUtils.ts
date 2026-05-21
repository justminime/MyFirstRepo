import type { GameState } from '../types';
import { CATEGORY_MAP } from '../data/categories';

const APP_URL = (import.meta.env['VITE_APP_URL'] as string | undefined) ?? 'https://meeting-bingo.vercel.app';

export function buildShareText(game: GameState): string {
  const category = game.category ? (CATEGORY_MAP[game.category]?.name ?? game.category) : 'Unknown';
  const elapsed =
    game.startedAt && game.completedAt
      ? Math.round((game.completedAt - game.startedAt) / 60_000)
      : null;
  const timeStr = elapsed !== null ? `${elapsed} min` : 'unknown time';

  return [
    'I got BINGO in my meeting! 🎯',
    `Winning word: "${game.winningWord ?? ''}" after ${timeStr}`,
    `Category: ${category} | ${game.filledCount}/24 squares`,
    `Play at: ${APP_URL}`,
  ].join('\n');
}

export async function shareResult(game: GameState): Promise<void> {
  const text = buildShareText(game);

  if (navigator.share) {
    await navigator.share({ title: 'Meeting Bingo', text });
    return;
  }

  await navigator.clipboard.writeText(text);
}
