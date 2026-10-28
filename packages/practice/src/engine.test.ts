import { createRng } from '@khelaghor/core';
import { describe, expect, it } from 'vitest';
import { checkResponse, nextItem, registerMisconceptions, registerTemplates, tokenize } from './engine';
import type { PracticeTemplate } from './types';

const add: PracticeTemplate = {
  id: 'test-add',
  kit: 'test',
  title: { bn: 'যোগ' },
  generate: (rng, level) => {
    const a = rng.int(1, 9);
    const b = rng.int(1, 9);
    return {
      id: `add-${a}-${b}`,
      templateId: 'test-add',
      level,
      speaker: 'tia',
      prompt: { bn: 'যোগ করো' },
      ask: { template: { bn: `${a} + ${b} = [s]` }, answers: { s: a + b } },
      showPicture: false,
      hints: [{ bn: '১' }, { bn: '২' }, { bn: '৩' }],
      vars: { a, b },
    };
  },
};

registerTemplates([add]);
registerMisconceptions([
  {
    id: 'test-off-by-one',
    title: { bn: 'এক কম/বেশি' },
    explain: { bn: 'আবার গোনো' },
    detect: (item, r) => r.kind === 'ask' && Math.abs((r.values.s ?? 0) - item.ask!.answers.s!) === 1,
  },
]);

describe('practice engine', () => {
  it('tokenizes slots', () => {
    expect(tokenize('১৪ ÷ ৪ = [q], ভাগশেষ [r]')).toEqual([
      { kind: 'text', value: '১৪ ÷ ৪ = ' },
      { kind: 'slot', id: 'q' },
      { kind: 'text', value: ', ভাগশেষ ' },
      { kind: 'slot', id: 'r' },
    ]);
  });
  it('checks answers and finds misconceptions', () => {
    const item = nextItem(createRng(1), [{ id: 'test-add', weight: 1 }], 'easy');
    const right = item.ask!.answers.s!;
    expect(checkResponse(item, { kind: 'ask', values: { s: right } }).correct).toBe(true);
    const off = checkResponse(item, { kind: 'ask', values: { s: right + 1 } }, ['test-off-by-one']);
    expect(off.correct).toBe(false);
    expect(off.misconception?.id).toBe('test-off-by-one');
    expect(checkResponse(item, { kind: 'ask', values: { s: right + 1 } }).misconception).toBeUndefined();
  });
  it('avoids repeating the previous item', () => {
    const rng = createRng(3);
    let prev = nextItem(rng, [{ id: 'test-add', weight: 1 }], 'easy');
    for (let i = 0; i < 50; i++) {
      const next = nextItem(rng, [{ id: 'test-add', weight: 1 }], 'easy', prev);
      expect(next.vars).not.toEqual(prev.vars);
      prev = next;
    }
  });
});
