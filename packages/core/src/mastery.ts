export type Attempt = {
  correct: boolean;
  /** The worked-step hint (last rung) was shown. */ usedWorked: boolean;
};

/** Mastery rule from the learning design: 3 in a row without the worked step, or 8 of the last 10. */
export function isMastered(attempts: readonly Attempt[]): boolean {
  const last3 = attempts.slice(-3);
  if (last3.length === 3 && last3.every((a) => a.correct && !a.usedWorked)) return true;
  const last10 = attempts.slice(-10);
  return last10.length >= 8 && last10.filter((a) => a.correct).length >= 8;
}

export type Level = 'easy' | 'medium' | 'hard';
const LEVELS: Level[] = ['easy', 'medium', 'hard'];

/** Adaptive level: down after 2 wrong in a row, up after 3 right in a row. */
export function nextLevel(level: Level, attempts: readonly Attempt[]): Level {
  const i = LEVELS.indexOf(level);
  const last2 = attempts.slice(-2);
  const last3 = attempts.slice(-3);
  if (last2.length === 2 && last2.every((a) => !a.correct)) return LEVELS[Math.max(0, i - 1)]!;
  if (last3.length === 3 && last3.every((a) => a.correct)) return LEVELS[Math.min(2, i + 1)]!;
  return level;
}

/** Stars for a finished practice round: 3 = all right first time, 2 = most, 1 = finished. */
export function practiceStars(firstTryCorrect: number, total: number): 1 | 2 | 3 {
  if (total === 0) return 1;
  const ratio = firstTryCorrect / total;
  if (ratio >= 0.9) return 3;
  if (ratio >= 0.6) return 2;
  return 1;
}
