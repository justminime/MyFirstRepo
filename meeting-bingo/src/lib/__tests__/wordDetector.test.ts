import { describe, it, expect } from 'vitest';
import { detectWords, detectWordsWithAliases, normalizeText } from '../wordDetector';

describe('normalizeText', () => {
  it('lowercases and trims', () => {
    expect(normalizeText('  Hello World  ')).toBe('hello world');
  });

  it('normalises curly apostrophe in contractions', () => {
    // U+2019 right single quotation mark (curly apostrophe)
    expect(normalizeText("it’s")).toBe("it's");
  });
});

describe('detectWords', () => {
  const filled = new Set<string>();

  it('detects a single word by boundary', () => {
    expect(detectWords('we need to pivot now', ['pivot'], filled)).toEqual(['pivot']);
  });

  it('does not match a substring inside another word', () => {
    expect(detectWords('the pivoting continues', ['pivot'], filled)).toEqual([]);
  });

  it('detects multi-word phrases', () => {
    expect(detectWords('let us circle back tomorrow', ['circle back'], filled)).toEqual(['circle back']);
  });

  it('skips already-filled words', () => {
    const done = new Set(['pivot']);
    expect(detectWords('time to pivot', ['pivot'], done)).toEqual([]);
  });

  it('detects multiple words in one transcript', () => {
    const result = detectWords('great synergy and lots of bandwidth', ['synergy', 'bandwidth'], filled);
    expect(result).toContain('synergy');
    expect(result).toContain('bandwidth');
  });

  it('is case-insensitive', () => {
    expect(detectWords('SYNERGY is key', ['synergy'], filled)).toEqual(['synergy']);
  });
});

describe('detectWordsWithAliases', () => {
  const filled = new Set<string>();

  it('detects CI/CD via alias "continuous integration"', () => {
    const result = detectWordsWithAliases('we need continuous integration here', ['CI/CD'], filled);
    expect(result).toContain('CI/CD');
  });

  it('detects ROI via alias "return on investment"', () => {
    const result = detectWordsWithAliases('the return on investment is clear', ['ROI'], filled);
    expect(result).toContain('ROI');
  });

  it('still detects direct matches', () => {
    const result = detectWordsWithAliases('great synergy', ['synergy'], filled);
    expect(result).toContain('synergy');
  });
});
