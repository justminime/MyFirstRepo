import { describe, it, expect } from 'vitest';
import { checkForBingo, countFilled, getClosestToWin } from '../bingoChecker';
import { generateCard } from '../cardGenerator';
import type { BingoCard } from '../../types';

function fillLine(card: BingoCard, type: 'row' | 'col' | 'diag1' | 'diag2', index = 0): BingoCard {
  const squares = card.squares.map(r => r.map(sq => ({ ...sq })));

  if (type === 'row') {
    squares[index]?.forEach(sq => { if (sq) sq.isFilled = true; });
  } else if (type === 'col') {
    squares.forEach(r => { const sq = r[index]; if (sq) sq.isFilled = true; });
  } else if (type === 'diag1') {
    [0, 1, 2, 3, 4].forEach(i => { const sq = squares[i]?.[i]; if (sq) sq.isFilled = true; });
  } else {
    [0, 1, 2, 3, 4].forEach(i => { const sq = squares[i]?.[4 - i]; if (sq) sq.isFilled = true; });
  }

  return { ...card, squares };
}

describe('checkForBingo', () => {
  it('returns null on a fresh card (only free space filled)', () => {
    expect(checkForBingo(generateCard('agile'))).toBeNull();
  });

  it('detects a row win', () => {
    const result = checkForBingo(fillLine(generateCard('agile'), 'row', 0));
    expect(result?.type).toBe('row');
    expect(result?.index).toBe(0);
    expect(result?.squares).toHaveLength(5);
  });

  it('detects all 5 rows', () => {
    [0, 1, 2, 3, 4].forEach(r => {
      const result = checkForBingo(fillLine(generateCard('agile'), 'row', r));
      expect(result?.type).toBe('row');
      expect(result?.index).toBe(r);
    });
  });

  it('detects all 5 columns', () => {
    [0, 1, 2, 3, 4].forEach(c => {
      const result = checkForBingo(fillLine(generateCard('corporate'), 'col', c));
      expect(result?.type).toBe('column');
      expect(result?.index).toBe(c);
    });
  });

  it('detects diagonal ↘', () => {
    const result = checkForBingo(fillLine(generateCard('tech'), 'diag1'));
    expect(result?.type).toBe('diagonal');
    expect(result?.index).toBe(0);
  });

  it('detects diagonal ↙', () => {
    const result = checkForBingo(fillLine(generateCard('tech'), 'diag2'));
    expect(result?.type).toBe('diagonal');
    expect(result?.index).toBe(1);
  });
});

describe('countFilled', () => {
  it('counts 1 on a fresh card (free space)', () => {
    expect(countFilled(generateCard('agile'))).toBe(1);
  });

  it('counts correctly after filling squares', () => {
    // row 0 (5 squares) + free space at [2][2] = 6
    expect(countFilled(fillLine(generateCard('agile'), 'row', 0))).toBe(6);
  });
});

describe('getClosestToWin', () => {
  it('returns null on a fully empty card', () => {
    const card = generateCard('agile');
    const blank: BingoCard = {
      ...card,
      squares: card.squares.map(r => r.map(sq => ({ ...sq, isFilled: false }))),
    };
    expect(getClosestToWin(blank)).toBeNull();
  });

  it('reports needed=1 and nextWord when one square away', () => {
    const base = generateCard('agile');
    const squares = base.squares.map(r => r.map(sq => ({ ...sq })));
    // Fill 4 of 5 in row 0
    [0, 1, 2, 3].forEach(c => { const sq = squares[0]?.[c]; if (sq) sq.isFilled = true; });
    const result = getClosestToWin({ ...base, squares });
    expect(result?.needed).toBe(1);
    expect(typeof result?.nextWord).toBe('string');
  });
});
