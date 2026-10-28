import { describe, expect, it } from 'vitest';
import { createRng, isMastered, nextLevel, practiceStars, type Attempt } from '.';

const ok: Attempt = { correct: true, usedWorked: false };
const bad: Attempt = { correct: false, usedWorked: false };
const helped: Attempt = { correct: true, usedWorked: true };

describe('rng', () => {
  it('is repeatable from a seed', () => {
    const a = createRng(42);
    const b = createRng(42);
    expect([a.int(1, 9), a.int(1, 9), a.next()]).toEqual([b.int(1, 9), b.int(1, 9), b.next()]);
  });
  it('stays in range', () => {
    const r = createRng(7);
    for (let i = 0; i < 1000; i++) {
      const n = r.int(2, 5);
      expect(n).toBeGreaterThanOrEqual(2);
      expect(n).toBeLessThanOrEqual(5);
    }
  });
});

describe('mastery', () => {
  it('needs 3 in a row without the worked step', () => {
    expect(isMastered([ok, ok])).toBe(false);
    expect(isMastered([bad, ok, ok, ok])).toBe(true);
    expect(isMastered([ok, helped, ok])).toBe(false);
  });
  it('accepts 8 of the last 10', () => {
    expect(isMastered([ok, ok, bad, ok, ok, bad, ok, ok, ok, helped])).toBe(true);
  });
  it('adapts the level', () => {
    expect(nextLevel('medium', [bad, bad])).toBe('easy');
    expect(nextLevel('medium', [ok, ok, ok])).toBe('hard');
    expect(nextLevel('hard', [ok, ok, ok])).toBe('hard');
    expect(nextLevel('easy', [ok, bad])).toBe('easy');
  });
  it('gives stars', () => {
    expect(practiceStars(8, 8)).toBe(3);
    expect(practiceStars(5, 8)).toBe(2);
    expect(practiceStars(2, 8)).toBe(1);
  });
});
