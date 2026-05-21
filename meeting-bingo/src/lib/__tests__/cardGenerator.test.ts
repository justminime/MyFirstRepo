import { describe, it, expect } from 'vitest';
import { generateCard } from '../cardGenerator';

describe('generateCard', () => {
  it('builds a 5x5 grid', () => {
    const card = generateCard('agile');
    expect(card.squares).toHaveLength(5);
    card.squares.forEach(row => expect(row).toHaveLength(5));
  });

  it('places FREE space at center [2][2]', () => {
    const card = generateCard('agile');
    const center = card.squares[2]?.[2];
    expect(center?.isFreeSpace).toBe(true);
    expect(center?.isFilled).toBe(true);
    expect(center?.word).toBe('FREE');
  });

  it('pre-fills only the free space', () => {
    const card = generateCard('corporate');
    const filled = card.squares.flat().filter(sq => sq.isFilled);
    expect(filled).toHaveLength(1);
  });

  it('produces 24 unique non-free words', () => {
    const card = generateCard('tech');
    expect(card.words).toHaveLength(24);
    expect(new Set(card.words).size).toBe(24);
  });

  it('assigns unique ids matching row-col', () => {
    const card = generateCard('agile');
    card.squares.forEach((row, r) => {
      row.forEach((sq, c) => {
        expect(sq.id).toBe(`${r}-${c}`);
        expect(sq.row).toBe(r);
        expect(sq.col).toBe(c);
      });
    });
  });

  it('produces different cards on repeated calls', () => {
    const a = generateCard('agile');
    const b = generateCard('agile');
    // Extremely unlikely to be identical
    expect(a.words.join()).not.toBe(b.words.join());
  });

  it('throws for an unknown category', () => {
    expect(() => generateCard('unknown' as never)).toThrow('Unknown category');
  });
});
