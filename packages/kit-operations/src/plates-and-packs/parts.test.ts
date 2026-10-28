import { describe, expect, it } from 'vitest';
import { configSchema, init, reducer, summarize, type State } from './model';
import { autoplay, explain, parts } from './parts';

const make = (c: Record<string, unknown>) => init(configSchema.parse(c));

/** Press ▶ until the toy says there is nothing left to show. */
function play(s: State): State {
  for (let guard = 0; guard < 100; guard++) {
    const a = autoplay(s);
    if (!a) return s;
    s = reducer(s, a);
  }
  throw new Error('autoplay did not stop');
}

const text = (s: State) =>
  explain(s, 'en')
    .map((l) => l.parts.map((p) => ('value' in p ? p.value : '')).join(' ') + (l.note ? ` // ${l.note}` : ''))
    .join('\n');

describe('plates and packs: lab parts, play and math lines', () => {
  it('▶ shares 14 among 4 to the end and shows the check and the remainder rule', () => {
    const s = play(make({ mode: 'share', total: 14, plates: 4 }));
    expect(summarize(s)).toMatchObject({ done: true, quotient: 3, remainder: 2 });
    expect(text(s)).toContain('4 × 3 + 2 = 14');
    expect(text(s)).toContain('2 < 4');
  });
  it('▶ evens out an unfair table before dealing rounds', () => {
    let s = make({ mode: 'share', total: 9, plates: 3 });
    s = reducer(s, { type: 'giveOne', to: 0 });
    s = play(s);
    expect(summarize(s)).toMatchObject({ done: true, quotient: 3, remainder: 0 });
  });
  it('▶ packs 18 chocolates in sixes', () => {
    const s = play(make({ mode: 'group', total: 18, size: 6, item: 'chocolate' }));
    expect(summarize(s)).toMatchObject({ done: true, quotient: 3, remainder: 0 });
    expect(text(s)).toContain('6 × 3 = 18');
  });
  it('turning a knob changes the toy through its own action', () => {
    let s = make({ mode: 'share', total: 12, plates: 3 });
    const kids = parts(s, 'bn').find((p) => p.id === 'kids')!;
    const plates = kids.knobs!.find((k) => k.id === 'plates')!;
    expect(plates).toMatchObject({ kind: 'number', value: 3 });
    if (plates.kind === 'number') s = reducer(s, plates.action(4));
    const item = parts(s, 'bn')
      .find((p) => p.id === 'pile')!
      .knobs!.find((k) => k.id === 'item')!;
    if (item.kind === 'choice') s = reducer(s, item.action('lemon'));
    expect(s.plates).toBe(4);
    expect(s.config.item).toBe('lemon');
    expect(summarize(play(s))).toMatchObject({ quotient: 3, remainder: 0 });
  });
  it('group mode offers a pack-size knob instead of children', () => {
    const ids = parts(make({ mode: 'group', total: 12, size: 3 }), 'bn').map((p) => p.id);
    expect(ids).toEqual(['pile', 'pack']);
  });
  it('restart (reset) keeps what the knobs changed', () => {
    let s = make({ mode: 'share', total: 12, plates: 3 });
    s = reducer(s, { type: 'setTotal', value: 20 });
    s = play(s);
    s = reducer(s, { type: 'reset' });
    expect(s.total).toBe(20);
    expect(summarize(s).pile).toBe(20);
  });
});
