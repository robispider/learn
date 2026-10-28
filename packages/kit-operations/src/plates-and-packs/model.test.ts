import { describe, expect, it } from 'vitest';
import { check, configSchema, init, reducer, summarize, type Action, type State } from './model';

const make = (c: Record<string, unknown>) => init(configSchema.parse(c));
const run = (s: State, ...actions: Action[]) => actions.reduce(reducer, s);

describe('plates and packs: share', () => {
  it('deals 12 biscuits to 3 children, 4 each (book p.63)', () => {
    let s = make({ mode: 'share', total: 12, plates: 3 });
    for (let i = 0; i < 4; i++) s = reducer(s, { type: 'deal' });
    const sum = summarize(s);
    expect(sum).toMatchObject({ done: true, quotient: 4, remainder: 0, pile: 0 });
    expect(check(s, { done: true, quotient: 4 })).toBe(true);
  });
  it('leaves 2 of 14 lemons for 4 friends (book p.73)', () => {
    const s = run(make({ mode: 'share', total: 14, plates: 4 }), { type: 'dealAll' });
    expect(summarize(s)).toMatchObject({ done: true, quotient: 3, remainder: 2 });
    const blocked = reducer(s, { type: 'deal' });
    expect(blocked.notice).toBe('not-enough');
  });
  it('shares nothing: 0 ÷ 3 = 0', () => {
    const s = make({ mode: 'share', total: 0, plates: 3 });
    expect(summarize(s)).toMatchObject({ done: true, quotient: 0, remainder: 0 });
  });
  it('tracks fairness when one plate gets extra', () => {
    let s = make({ mode: 'share', total: 6, plates: 3 });
    s = reducer(s, { type: 'giveOne', to: 0 });
    expect(summarize(s).fair).toBe(false);
    s = reducer(s, { type: 'deal' }); // tops up plates 1 and 2 first
    expect(summarize(s).counts).toEqual([2, 1, 1]);
  });
  it('blocks unfair giving when not allowed', () => {
    let s = make({ mode: 'share', total: 6, plates: 3, allowUnfair: false });
    s = reducer(s, { type: 'giveOne', to: 0 });
    s = reducer(s, { type: 'giveOne', to: 0 });
    expect(s.notice).toBe('full');
    expect(summarize(s).counts).toEqual([1, 0, 0]);
  });
  it('starts with rounds already dealt', () => {
    const s = make({ mode: 'share', total: 19, plates: 3, start: 2 });
    expect(summarize(s).counts).toEqual([2, 2, 2]);
    expect(s.notice).toBeNull();
  });
  it('undoes a move by dragging back to the pile', () => {
    let s = run(make({ mode: 'share', total: 6, plates: 3 }), { type: 'deal' });
    s = reducer(s, { type: 'place', item: 0, to: 'pile' });
    expect(summarize(s).pile).toBe(4);
  });
});

describe('plates and packs: group', () => {
  it('makes packs of 3 from 12 → 4 children (book p.66)', () => {
    const s = run(
      make({ mode: 'group', total: 12, size: 3 }),
      { type: 'pack' },
      { type: 'pack' },
      { type: 'pack' },
      { type: 'pack' },
    );
    expect(summarize(s)).toMatchObject({ done: true, quotient: 4, remainder: 0 });
    expect(reducer(s, { type: 'pack' }).notice).toBe('not-enough');
  });
  it("fixes Rafi's 19 ÷ 3 = 5 r 4 with one more pack (book p.74)", () => {
    let s = make({ mode: 'group', total: 19, size: 3, start: 5 });
    expect(summarize(s)).toMatchObject({ quotient: 5, pile: 4, done: false });
    s = reducer(s, { type: 'pack' });
    expect(summarize(s)).toMatchObject({ done: true, quotient: 6, remainder: 1 });
  });
  it('rejects a 4th item in a pack of 3', () => {
    let s = make({ mode: 'group', total: 6, size: 3 });
    for (let i = 0; i < 3; i++) s = reducer(s, { type: 'place', item: i, to: 0 });
    s = reducer(s, { type: 'place', item: 3, to: 0 });
    expect(s.notice).toBe('full');
    s = reducer(s, { type: 'place', item: 3, to: 1 });
    expect(summarize(s).counts).toEqual([3, 1]);
  });
  it('drops an emptied last pack', () => {
    let s = make({ mode: 'group', total: 6, size: 3 });
    s = reducer(s, { type: 'place', item: 0, to: 0 });
    s = reducer(s, { type: 'place', item: 0, to: 'pile' });
    expect(s.packs).toBe(0);
  });
});
