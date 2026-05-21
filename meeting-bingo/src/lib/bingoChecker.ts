import type { BingoCard, BingoSquare, WinningLine } from '../types';

const INDICES = [0, 1, 2, 3, 4] as const;

function getRow(card: BingoCard, r: number): BingoSquare[] {
  return card.squares[r] ?? [];
}

function getSquare(card: BingoCard, r: number, c: number): BingoSquare | undefined {
  return card.squares[r]?.[c];
}

export function checkForBingo(card: BingoCard): WinningLine | null {
  // Rows
  for (const r of INDICES) {
    const row = getRow(card, r);
    if (row.length === 5 && row.every(sq => sq.isFilled)) {
      return { type: 'row', index: r, squares: row.map(sq => sq.id) };
    }
  }

  // Columns
  for (const c of INDICES) {
    if (INDICES.every(r => getSquare(card, r, c)?.isFilled)) {
      return {
        type: 'column',
        index: c,
        squares: INDICES.map(r => getSquare(card, r, c)?.id ?? `${r}-${c}`),
      };
    }
  }

  // Diagonal ↘
  if (INDICES.every(i => getSquare(card, i, i)?.isFilled)) {
    return { type: 'diagonal', index: 0, squares: INDICES.map(i => `${i}-${i}`) };
  }

  // Diagonal ↙
  if (INDICES.every(i => getSquare(card, i, 4 - i)?.isFilled)) {
    return { type: 'diagonal', index: 1, squares: INDICES.map(i => `${i}-${4 - i}`) };
  }

  return null;
}

export function countFilled(card: BingoCard): number {
  return card.squares.flat().filter(sq => sq.isFilled).length;
}

type ClosestResult = { needed: number; line: string; nextWord: string | null };

export function getClosestToWin(card: BingoCard): ClosestResult | null {
  type Line = { sqs: BingoSquare[]; name: string };

  const lines: Line[] = [
    ...INDICES.map(r => ({ sqs: getRow(card, r), name: `Row ${r + 1}` })),
    ...INDICES.map(c => ({
      sqs: INDICES.map(r => getSquare(card, r, c)).filter((sq): sq is BingoSquare => sq !== undefined),
      name: `Column ${c + 1}`,
    })),
    {
      sqs: INDICES.map(i => getSquare(card, i, i)).filter((sq): sq is BingoSquare => sq !== undefined),
      name: 'Diagonal ↘',
    },
    {
      sqs: INDICES.map(i => getSquare(card, i, 4 - i)).filter((sq): sq is BingoSquare => sq !== undefined),
      name: 'Diagonal ↙',
    },
  ];

  let best: ClosestResult | null = null;

  for (const { sqs, name } of lines) {
    if (sqs.length < 5) continue;
    const needed = sqs.filter(sq => !sq.isFilled).length;
    if (needed === 0 || needed === 5) continue;
    if (best === null || needed < best.needed) {
      const nextWord = needed === 1 ? (sqs.find(sq => !sq.isFilled)?.word ?? null) : null;
      best = { needed, line: name, nextWord };
    }
  }

  return best;
}
