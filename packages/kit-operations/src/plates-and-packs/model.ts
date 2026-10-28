import { ITEM_KINDS, type ItemKind } from '@khelaghor/art';
import { z } from 'zod';

/**
 * T5 Plates & Packs. Two meanings of division on one table:
 * - share (partitive): N plates, deal the pile out one round at a time → how many each?
 * - group (quotative): fill packs of `size` → how many packs (children)?
 * Whatever is left in the pile when no full round/pack is possible is the remainder.
 */
export const configSchema = z.object({
  mode: z.enum(['share', 'group']),
  total: z.number().int().min(0).max(60),
  /** share: number of children / plates. */
  plates: z.number().int().min(1).max(9).default(3),
  /** group: items per pack. */
  size: z.number().int().min(1).max(9).default(3),
  item: z.enum(ITEM_KINDS as [ItemKind, ...ItemKind[]]).default('biscuit'),
  /** Rounds (share) or packs (group) already done when the toy opens. */
  start: z.number().int().min(0).default(0),
  /** Chip labels: story words (বস্তু / শিশু …) or the terms ভাজ্য / ভাজক / ভাগফল / ভাগশেষ. */
  labels: z.enum(['story', 'terms']).default('story'),
  /** Free play: the child can change the numbers. */
  editable: z.boolean().default(false),
  /** Show how many are on each plate/pack (off for practice pictures, where the child counts). */
  showCounts: z.boolean().default(true),
  /** Allow a partial round (some plates get one more): only for "is it fair?" play. */
  allowUnfair: z.boolean().default(true),
});
export type Config = z.infer<typeof configSchema>;
export type ConfigInput = z.input<typeof configSchema>;

export type Notice = 'not-enough' | 'full' | 'done' | null;

export type State = {
  config: Config;
  total: number;
  plates: number;
  size: number;
  /** Where each item is: a plate/pack index, or null for the pile. */
  where: (number | null)[];
  /** Packs opened so far (group mode). */
  packs: number;
  notice: Notice;
  /** Increments on every notice, so the view can replay its animation. */
  nonce: number;
};

export type Action =
  | { type: 'deal' }
  | { type: 'dealAll' }
  | { type: 'pack' }
  | { type: 'place'; item: number; to: number | 'pile' }
  | { type: 'giveOne'; to: number }
  | { type: 'setTotal'; value: number }
  | { type: 'setPlates'; value: number }
  | { type: 'setSize'; value: number }
  | { type: 'setItem'; value: ItemKind }
  | { type: 'reset' };

export const LIMITS = { total: [0, 30], plates: [1, 6], size: [1, 6] } as const;

export function init(config: Config): State {
  let s: State = {
    config,
    total: config.total,
    plates: config.plates,
    size: config.size,
    where: Array.from({ length: config.total }, () => null),
    packs: 0,
    notice: null,
    nonce: 0,
  };
  for (let i = 0; i < config.start; i++) s = reducer(s, { type: config.mode === 'share' ? 'deal' : 'pack' });
  return { ...s, notice: null };
}

export type Summary = {
  pile: number;
  /** Items per plate (share) or per pack (group). */
  counts: number[];
  /** Number of plates (share) or packs including an open one (group) to draw. */
  slots: number;
  fair: boolean;
  done: boolean;
  /** Each child's share (share) or the number of full packs (group). */
  quotient: number;
  remainder: number;
  /** Items each plate has for sure (completed rounds). */
  rounds: number;
};

export function summarize(s: State): Summary {
  const pile = s.where.filter((w) => w === null).length;
  if (s.config.mode === 'share') {
    const counts = Array.from({ length: s.plates }, (_, k) => s.where.filter((w) => w === k).length);
    const min = Math.min(...counts);
    const fair = counts.every((c) => c === counts[0]);
    const done = fair && pile < s.plates;
    return {
      pile,
      counts,
      slots: s.plates,
      fair,
      done,
      quotient: counts[0] ?? 0,
      remainder: pile,
      rounds: min,
    };
  }
  const counts = Array.from({ length: s.packs }, (_, k) => s.where.filter((w) => w === k).length);
  const full = counts.filter((c) => c === s.size).length;
  const fair = counts.every((c) => c === s.size);
  const done = fair && pile < s.size;
  return {
    pile,
    counts,
    slots: s.packs + (done ? 0 : 1),
    fair,
    done,
    quotient: full,
    remainder: pile,
    rounds: full,
  };
}

/** Biggest number of packs this state could ever need, so pack positions never shift. */
export function maxPacks(s: State): number {
  return Math.max(1, Math.ceil(s.total / Math.max(1, s.size)));
}

function notice(s: State, n: Notice): State {
  return { ...s, notice: n, nonce: s.nonce + 1 };
}

function pileItems(s: State): number[] {
  const out: number[] = [];
  s.where.forEach((w, i) => w === null && out.push(i));
  return out;
}

function withDoneNotice(s: State): State {
  const sum = summarize(s);
  return sum.done ? notice(s, 'done') : { ...s, notice: null };
}

export function reducer(s: State, a: Action): State {
  const mode = s.config.mode;
  switch (a.type) {
    case 'deal': {
      if (mode !== 'share') return s;
      const pile = pileItems(s);
      if (pile.length < s.plates) return notice(s, 'not-enough');
      // Top up the plates that have the least first, so a round always evens things out.
      const counts = summarize(s).counts;
      const order = counts.map((c, k) => ({ c, k })).sort((x, y) => x.c - y.c || x.k - y.k);
      const where = [...s.where];
      order.forEach(({ k }, j) => (where[pile[j]!] = k));
      return withDoneNotice({ ...s, where });
    }
    case 'dealAll': {
      let next = s;
      for (let guard = 0; guard < 100; guard++) {
        const sum = summarize(next);
        if (sum.done) break;
        const after = reducer(next, { type: mode === 'share' ? 'deal' : 'pack' });
        if (after.notice === 'not-enough') break;
        next = after;
      }
      return withDoneNotice(next);
    }
    case 'pack': {
      if (mode !== 'group') return s;
      const pile = pileItems(s);
      // Finish an open, partly filled pack first.
      const sum = summarize(s);
      const open = sum.counts.findIndex((c) => c < s.size);
      const target = open >= 0 ? open : s.packs;
      const need = s.size - (sum.counts[target] ?? 0);
      if (pile.length < need) return notice(s, 'not-enough');
      const where = [...s.where];
      pile.slice(0, need).forEach((i) => (where[i] = target));
      return withDoneNotice({ ...s, where, packs: Math.max(s.packs, target + 1) });
    }
    case 'place': {
      if (a.item < 0 || a.item >= s.total) return s;
      if (a.to === 'pile') {
        if (s.where[a.item] === null) return s;
        const where = [...s.where];
        where[a.item] = null;
        return trimPacks({ ...s, where, notice: null });
      }
      if (s.where[a.item] === a.to) return s;
      const sum = summarize(s);
      if (mode === 'share') {
        if (a.to >= s.plates) return s;
        if (!s.config.allowUnfair && (sum.counts[a.to] ?? 0) > sum.rounds) return notice(s, 'full');
      } else {
        if (a.to > s.packs || a.to >= maxPacks(s)) return s;
        if ((sum.counts[a.to] ?? 0) >= s.size) return notice(s, 'full');
      }
      const where = [...s.where];
      where[a.item] = a.to;
      return withDoneNotice(trimPacks({ ...s, where, packs: Math.max(s.packs, a.to + 1) }));
    }
    case 'giveOne': {
      const first = s.where.findIndex((w) => w === null);
      if (first < 0) return notice(s, 'not-enough');
      return reducer(s, { type: 'place', item: first, to: a.to });
    }
    case 'setTotal': {
      const total = clamp(a.value, LIMITS.total);
      return { ...s, total, where: Array.from({ length: total }, () => null), packs: 0, notice: null };
    }
    case 'setPlates': {
      const plates = clamp(a.value, LIMITS.plates);
      return { ...s, plates, where: s.where.map(() => null), packs: 0, notice: null };
    }
    case 'setSize': {
      const size = clamp(a.value, LIMITS.size);
      return { ...s, size, where: s.where.map(() => null), packs: 0, notice: null };
    }
    case 'setItem':
      return ITEM_KINDS.includes(a.value) ? { ...s, config: { ...s.config, item: a.value } } : s;
    case 'reset':
      return { ...s, where: s.where.map(() => null), packs: 0, notice: null };
  }
}

/** Drop empty packs at the end (group mode), so the open pack is always the next one. */
function trimPacks(s: State): State {
  if (s.config.mode !== 'group') return s;
  let packs = s.packs;
  while (packs > 0 && !s.where.some((w) => w === packs - 1)) packs--;
  return packs === s.packs ? s : { ...s, packs };
}

function clamp(v: number, [lo, hi]: readonly [number, number]) {
  return Math.max(lo, Math.min(hi, Math.round(v)));
}

/** What a Try step can ask the toy to reach. Every field given must match. */
export const expectSchema = z
  .object({
    done: z.boolean().optional(),
    quotient: z.number().int().optional(),
    remainder: z.number().int().optional(),
    /** At least this many complete rounds / full packs. */
    rounds: z.number().int().optional(),
    total: z.number().int().optional(),
    plates: z.number().int().optional(),
    size: z.number().int().optional(),
  })
  .strict();
export type Expect = z.infer<typeof expectSchema>;

export function check(s: State, raw: unknown): boolean {
  const e = expectSchema.parse(raw);
  const sum = summarize(s);
  if (e.done !== undefined && sum.done !== e.done) return false;
  if (e.quotient !== undefined && (!sum.done || sum.quotient !== e.quotient)) return false;
  if (e.remainder !== undefined && (!sum.done || sum.remainder !== e.remainder)) return false;
  if (e.rounds !== undefined && sum.rounds < e.rounds) return false;
  if (e.total !== undefined && s.total !== e.total) return false;
  if (e.plates !== undefined && s.plates !== e.plates) return false;
  if (e.size !== undefined && s.size !== e.size) return false;
  return true;
}
