import { createRng, type Level } from '@khelaghor/core';
import { checkResponse, registerMisconceptions, tokenize } from '@khelaghor/practice';
import { describe, expect, it } from 'vitest';
import { configSchema } from './model';
import { misconceptions, templates } from './practice';

registerMisconceptions(misconceptions);
const LEVELS: Level[] = ['easy', 'medium', 'hard'];

describe('division practice templates', () => {
  for (const t of templates) {
    it(`${t.id}: 10,000 generated items are valid`, () => {
      const rng = createRng(2026);
      for (let n = 0; n < 10_000; n++) {
        const level = LEVELS[n % 3]!;
        const item = t.generate(rng, level);
        const { a, b } = item.vars as { a: number; b: number };
        expect(a).toBeLessThanOrEqual(89);
        expect(b).toBeGreaterThanOrEqual(2);
        expect(item.hints).toHaveLength(3);
        expect(item.prompt.bn).not.toMatch(/\{\w+\}/);
        if (item.ask) {
          const slots = tokenize(item.ask.template.bn)
            .filter((x) => x.kind === 'slot')
            .map((x) => (x as { id: string }).id);
          expect(slots.sort()).toEqual(Object.keys(item.ask.answers).sort());
          const { q, r = 0 } = item.ask.answers as { q: number; r?: number };
          expect(b * q + r).toBe(a);
          expect(r).toBeLessThan(b);
          expect(checkResponse(item, { kind: 'ask', values: item.ask.answers }).correct).toBe(true);
        }
        if (item.choose) {
          expect(item.choose.answer).toBeGreaterThanOrEqual(0);
          expect(item.choose.answer).toBeLessThan(item.choose.options.length);
        }
        if (item.picture) configSchema.parse(item.picture.config);
        if (item.showPicture) expect(item.picture).toBeDefined();
      }
    });
  }

  it('spots a remainder that is too big', () => {
    const rem = templates.find((t) => t.id === 'div-remainder')!;
    const rng = createRng(5);
    let item = rem.generate(rng, 'medium');
    while ((item.vars.q as number) < 2) item = rem.generate(rng, 'medium');
    const { a, b } = item.vars as { a: number; b: number; q: number };
    const q = Math.floor(a / b) - 1;
    const res = checkResponse(item, { kind: 'ask', values: { q, r: a - b * q } }, [
      'remainder-not-less-than-divisor',
    ]);
    expect(res.correct).toBe(false);
    expect(res.misconception?.id).toBe('remainder-not-less-than-divisor');
  });
});
