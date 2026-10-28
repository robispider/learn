import { BookSchema } from '@khelaghor/core';
import { hasMisconception, hasTemplate } from '@khelaghor/practice';
import { STICKER_IDS } from '@khelaghor/art';
import { describe, expect, it } from 'vitest';
import book from '.';

/** `pnpm validate`: every lesson must fit the schemas of the toys, templates and words it uses. */
describe('Class 3 Math content', () => {
  const data = BookSchema.parse(book.data);
  const glossary = new Set(data.glossary.map((g) => g.id));
  const characters = new Set(data.characters.map((c) => c.id));
  const stickers = new Set(data.stickers.map((s) => s.id));

  it('has 13 chapters in book order with matching page ranges', () => {
    expect(data.chapters.map((c) => c.no)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]);
    for (let i = 1; i < data.chapters.length; i++)
      expect(data.chapters[i]!.bookPages[0]).toBeGreaterThan(data.chapters[i - 1]!.bookPages[1]);
  });

  for (const chapter of data.chapters) {
    for (const topic of chapter.topics) {
      describe(`topic ${topic.id}`, () => {
        it('sits inside its chapter pages', () => {
          expect(topic.bookPages[0]).toBeGreaterThanOrEqual(chapter.bookPages[0]);
          expect(topic.bookPages[1]).toBeLessThanOrEqual(chapter.bookPages[1]);
        });
        it('uses known toys with valid configs, expects and speakers', () => {
          const blocks = [
            {
              toy: topic.explore.toy,
              config: topic.explore.config,
              steps: [] as (typeof topic.try)[number]['steps'],
            },
            ...topic.try,
          ];
          for (const b of blocks) {
            const toy = book.toys[b.toy];
            expect(toy, b.toy).toBeDefined();
            toy!.configSchema.parse(b.config);
            for (const s of b.steps) {
              expect(characters.has(s.say), s.say).toBe(true);
              if (s.setup !== undefined) toy!.configSchema.parse(s.setup);
              if (s.expect !== undefined) toy!.expectSchema!.parse(s.expect);
              if (s.choose) expect(s.choose.answer).toBeLessThan(s.choose.options.length);
              const fill = s.ask?.template.bn.match(/\[(\w+)\]/g)?.map((m) => m.slice(1, -1)) ?? [];
              expect(fill.sort()).toEqual(Object.keys(s.ask?.answers ?? {}).sort());
            }
          }
          if (topic.explore.goal !== undefined)
            book.toys[topic.explore.toy]!.expectSchema!.parse(topic.explore.goal);
          for (const line of topic.explore.hook) expect(characters.has(line.say)).toBe(true);
        });
        it('can reach every toy goal it asks for', () => {
          // Play each `expect: { done: true }` step to the end with the toy's own actions.
          for (const b of topic.try) {
            const toy = book.toys[b.toy]!;
            let config = b.config;
            for (const s of b.steps) {
              if (s.setup !== undefined) config = s.setup;
              if (s.expect === undefined) continue;
              const state = toy.reducer(toy.init(toy.configSchema.parse(config)), { type: 'dealAll' });
              expect(toy.check!(state, s.expect), `${topic.id}: ${JSON.stringify(s.expect)}`).toBe(true);
            }
          }
        });
        it('uses known practice templates, misconceptions, words and stickers', () => {
          for (const t of topic.practice.templates) expect(hasTemplate(t.id), t.id).toBe(true);
          for (const m of topic.practice.misconceptions) expect(hasMisconception(m), m).toBe(true);
          for (const v of topic.learn.vocab) expect(glossary.has(v), v).toBe(true);
          expect(stickers.has(topic.sticker) && STICKER_IDS.includes(topic.sticker)).toBe(true);
          if (topic.game) expect(book.games[topic.game]).toBeDefined();
        });
      });
    }
  }
});
