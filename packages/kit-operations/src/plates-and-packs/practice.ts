import type { ItemKind } from '@khelaghor/art';
import type { Level, Rng } from '@khelaghor/core';
import type { I18n } from '@khelaghor/i18n';
import type { Misconception, PracticeItem, PracticeTemplate } from '@khelaghor/practice';
import type { ConfigInput } from './model';
import { ITEM_NAMES } from './strings';

const TOY = 'operations/plates-and-packs';
const ITEMS: ItemKind[] = ['biscuit', 'orange', 'lemon', 'chocolate'];

/** Number ranges per level: divisor b, quotient q. Totals stay within the multiplication tables (≤ 9 × 9). */
const RANGES: Record<Level, { b: [number, number]; q: [number, number]; picture: boolean }> = {
  easy: { b: [2, 4], q: [1, 5], picture: true },
  medium: { b: [2, 6], q: [2, 7], picture: false },
  hard: { b: [2, 9], q: [2, 9], picture: false },
};

/** Fill {a} {b} {item} … into both languages. */
function txt(t: I18n, vars: Record<string, string | number>): I18n {
  const f = (s: string, lang: 'bn' | 'en') =>
    s.replace(/\{(\w+)\}/g, (_, k: string) => {
      const v = vars[k];
      if (v === undefined) return `{${k}}`;
      if (typeof v === 'number')
        return lang === 'bn' ? String(v).replace(/\d/g, (d) => '০১২৩৪৫৬৭৮৯'[Number(d)]!) : String(v);
      return v;
    });
  return { bn: f(t.bn, 'bn'), en: t.en ? f(t.en, 'en') : undefined };
}
const itemVars = (kind: ItemKind) => ({ item: ITEM_NAMES[kind].bn, itemEn: ITEM_NAMES[kind].en ?? '' });

/** Pictures above ~30 items get too crowded, so bigger numbers are symbol-only. */
const PICTURE_MAX = 30;

const TERMS = {
  labels: { q: { bn: 'ভাগফল', en: 'quotient' }, r: { bn: 'ভাগশেষ', en: 'remainder' } },
  colors: { q: 'quotient', r: 'remainder' },
} as const;

export const T = {
  shareQ: {
    bn: '{a}টি {item} {b} জনকে সমানভাবে ভাগ করে দিলে প্রত্যেকে কয়টি করে পাবে?',
    en: '{a} {itemEn} are shared equally among {b} children. How many does each get?',
  },
  groupQ: {
    bn: '{a}টি {item} থেকে প্রত্যেককে {b}টি করে দিলে কতজনকে দেওয়া যাবে?',
    en: 'There are {a} {itemEn}. If each child gets {b}, how many children get some?',
  },
  bareQ: { bn: 'ভাগ করো।', en: 'Divide.' },
  remQ: {
    bn: '{a}টি {item} {b} জনকে সমানভাবে দিলে প্রত্যেকে কয়টি করে পাবে, আর কয়টি অবশিষ্ট থাকবে?',
    en: '{a} {itemEn} are shared equally among {b} children. How many does each get, and how many are left?',
  },
  divSentence: { bn: '{a} ÷ {b} = [q]', en: '{a} ÷ {b} = [q]' },
  remSentence: { bn: '{a} ÷ {b} = [q], অবশিষ্ট [r]', en: '{a} ÷ {b} = [q], remainder [r]' },
  meaningQ: { bn: '{story} এখানে আমরা কী খুঁজছি?', en: '{story} What are we finding here?' },
  meaningShareStory: {
    bn: '{a}টি {item} {b} জন বন্ধুকে সমানভাবে দেওয়া হবে।',
    en: '{a} {itemEn} will be shared equally among {b} friends.',
  },
  meaningGroupStory: {
    bn: '{a}টি {item} থেকে প্রত্যেক বন্ধুকে {b}টি করে দেওয়া হবে।',
    en: 'From {a} {itemEn}, each friend will get {b}.',
  },
  meaningShare: { bn: 'প্রত্যেকে কয়টি করে পাবে', en: 'How many each friend gets' },
  meaningGroup: { bn: 'কতজনকে দেওয়া যাবে', en: 'How many friends get some' },
  meaningBoth: { bn: 'মোট কয়টি আছে', en: 'How many there are in all' },
  hShare1: {
    bn: '{b} জনকে একবার করে দিলে {b}টি লাগে। কতবার দেওয়া যাবে?',
    en: 'One round to {b} children uses {b}. How many rounds can you give?',
  },
  hShare2: {
    bn: 'ছবিতে একবার করে দাও, তারপর একটি প্লেটে গুনে দেখো।',
    en: 'Deal in the picture, then count one plate.',
  },
  hShare3: { bn: '{b} × {q} = {a}, তাই {a} ÷ {b} = {q}', en: '{b} × {q} = {a}, so {a} ÷ {b} = {q}' },
  hGroup1: { bn: '{a} থেকে {b} করে কতবার নেওয়া যায়?', en: 'How many times can you take {b} from {a}?' },
  hGroup2: {
    bn: 'ছবিতে {b}টি করে প্যাকেট বানাও, তারপর প্যাকেট গোনো।',
    en: 'Make packs of {b} in the picture, then count the packs.',
  },
  hGroup3: { bn: '{q} × {b} = {a}, তাই {a} ÷ {b} = {q}', en: '{q} × {b} = {a}, so {a} ÷ {b} = {q}' },
  hRem1: {
    bn: '{b}-এর নামতায় {a}-এর সমান বা ছোট সবচেয়ে বড় সংখ্যা কোনটি?',
    en: 'In the {b} times table, which is the biggest number not more than {a}?',
  },
  hRem2: {
    bn: 'ছবিতে একবার করে দিতে থাকো, যতক্ষণ সবাইকে দেওয়া যায়।',
    en: 'Keep dealing in the picture while everyone can get one more.',
  },
  hRem3: {
    bn: '{b} × {q} = {bq}, {a} − {bq} = {r}। তাই {a} ÷ {b} = {q}, অবশিষ্ট {r}',
    en: '{b} × {q} = {bq}, {a} − {bq} = {r}. So {a} ÷ {b} = {q}, remainder {r}',
  },
  hMeaning1: {
    bn: 'কয়জন আছে জানা আছে, নাকি প্রত্যেকে কয়টি পাবে জানা আছে?',
    en: 'Do we know how many friends, or how many each one gets?',
  },
  hMeaning2: { bn: 'যা জানা নেই, সেটাই আমরা খুঁজছি।', en: 'We are finding the thing we don’t know yet.' },
  hMeaning3: {
    bn: 'জন সংখ্যা জানা থাকলে খুঁজি "প্রত্যেকে কয়টি"; প্রত্যেকের ভাগ জানা থাকলে খুঁজি "কতজন"।',
    en: 'If we know how many friends, we find "how many each"; if we know how many each, we find "how many friends".',
  },
} satisfies Record<string, I18n>;

function picture(
  mode: 'share' | 'group',
  a: number,
  b: number,
  kind: ItemKind,
): { toy: string; config: ConfigInput } | undefined {
  if (a > PICTURE_MAX || b > 6 || (mode === 'group' && Math.ceil(a / b) > 9)) return undefined;
  return {
    toy: TOY,
    config:
      mode === 'share'
        ? { mode, total: a, plates: b, item: kind, showCounts: false }
        : { mode, total: a, size: b, item: kind, showCounts: false },
  };
}

function exact(mode: 'share' | 'group'): PracticeTemplate {
  const id = mode === 'share' ? 'div-share-exact' : 'div-group-exact';
  return {
    id,
    kit: 'operations',
    title:
      mode === 'share' ? { bn: 'সমান ভাগ', en: 'Equal sharing' } : { bn: 'দল বানানো', en: 'Equal groups' },
    misconceptions: ['div-multiplied', 'div-overshoot'],
    generate(rng: Rng, level: Level): PracticeItem {
      const r = RANGES[level];
      const b = rng.int(...r.b);
      const q = rng.int(...r.q);
      const a = b * q;
      const kind = rng.pick(ITEMS);
      const v = { a, b, q, ...itemVars(kind) };
      const pic = picture(mode, a, b, kind);
      const bare = level === 'hard';
      return {
        id: `${id}:${a}:${b}:${kind}`,
        templateId: id,
        level,
        speaker: mode === 'share' ? 'rafi' : 'tuli',
        prompt: bare ? T.bareQ : txt(mode === 'share' ? T.shareQ : T.groupQ, v),
        ask: { template: txt(T.divSentence, v), answers: { q }, colors: { q: 'quotient' } },
        picture: pic,
        showPicture: r.picture && !!pic,
        hints:
          mode === 'share'
            ? [txt(T.hShare1, v), txt(T.hShare2, v), txt(T.hShare3, v)]
            : [txt(T.hGroup1, v), txt(T.hGroup2, v), txt(T.hGroup3, v)],
        vars: { a, b, q },
      };
    },
  };
}

export const divShareExact = exact('share');
export const divGroupExact = exact('group');

/** Read a story and decide which meaning of division it is (share vs group). */
export const divMeaning: PracticeTemplate = {
  id: 'div-meaning',
  kit: 'operations',
  title: { bn: 'কোন ভাগ?', en: 'Which division?' },
  generate(rng, level) {
    const b = rng.int(2, 6);
    const q = rng.int(2, level === 'easy' ? 5 : 9);
    const a = b * q;
    const kind = rng.pick(ITEMS);
    const mode = rng.pick(['share', 'group'] as const);
    const v = { a, b, q, ...itemVars(kind) };
    const story = txt(mode === 'share' ? T.meaningShareStory : T.meaningGroupStory, v);
    const options = rng.shuffle([T.meaningShare, T.meaningGroup, T.meaningBoth]);
    return {
      id: `div-meaning:${mode}:${a}:${b}`,
      templateId: 'div-meaning',
      level,
      speaker: 'tia',
      prompt: {
        bn: T.meaningQ.bn.replace('{story}', story.bn),
        en: T.meaningQ.en.replace('{story}', story.en ?? ''),
      },
      choose: { options, answer: options.indexOf(mode === 'share' ? T.meaningShare : T.meaningGroup) },
      picture: picture(mode, a, b, kind),
      showPicture: false,
      hints: [T.hMeaning1, T.hMeaning2, T.hMeaning3],
      vars: { a, b, share: mode === 'share' ? 1 : 0 },
    };
  },
};

export const divRemainder: PracticeTemplate = {
  id: 'div-remainder',
  kit: 'operations',
  title: { bn: 'ভাগশেষ', en: 'Remainders' },
  misconceptions: ['remainder-not-less-than-divisor', 'div-overshoot', 'div-multiplied'],
  generate(rng, level) {
    const rr = RANGES[level];
    const b = rng.int(Math.max(3, rr.b[0]), Math.max(3, rr.b[1]));
    const q = rng.int(...rr.q);
    // Mostly a real remainder; now and then none, so children learn ভাগশেষ can be ০.
    const r = rng.next() < 0.12 ? 0 : rng.int(1, b - 1);
    const a = b * q + r;
    const kind = rng.pick(ITEMS);
    const v = { a, b, q, r, bq: b * q, ...itemVars(kind) };
    const pic = picture('share', a, b, kind);
    return {
      id: `div-remainder:${a}:${b}:${kind}`,
      templateId: 'div-remainder',
      level,
      speaker: 'rafi',
      prompt: level === 'hard' ? T.bareQ : txt(T.remQ, v),
      ask: { template: txt(T.remSentence, v), answers: { q, r }, ...TERMS },
      picture: pic,
      showPicture: rr.picture && !!pic,
      hints: [txt(T.hRem1, v), txt(T.hRem2, v), txt(T.hRem3, v)],
      vars: { a, b, q, r },
    };
  },
};

export const templates: PracticeTemplate[] = [divShareExact, divGroupExact, divMeaning, divRemainder];

const answer = (r: Parameters<Misconception['detect']>[1], k: string) =>
  r.kind === 'ask' ? r.values[k] : undefined;

export const misconceptions: Misconception[] = [
  {
    id: 'remainder-not-less-than-divisor',
    title: { bn: 'ভাগশেষ ভাজকের চেয়ে বড়', en: 'Remainder too big' },
    explain: {
      bn: 'অবশিষ্ট থেকে সবাইকে আরও একটি করে দেওয়া যায়! ভাগশেষ সবসময় ভাজকের চেয়ে ছোট হয়।',
      en: 'The leftovers can still be shared — everyone can get one more! The remainder is always less than the divisor.',
    },
    detect: (item, r) => {
      const q = answer(r, 'q');
      const rem = answer(r, 'r');
      const { a, b } = item.vars as { a: number; b: number };
      return q !== undefined && rem !== undefined && rem >= b && b * q + rem === a;
    },
  },
  {
    id: 'div-overshoot',
    title: { bn: 'ভাগফল বেশি হয়ে গেছে', en: 'Quotient too big' },
    explain: {
      bn: 'এতগুলো করে দিতে গেলে যতগুলো আছে তার চেয়ে বেশি লাগবে। গুণ করে মিলিয়ে দেখো।',
      en: 'Giving that many would need more than we have. Multiply to check.',
    },
    detect: (item, r) => {
      const q = answer(r, 'q');
      const { a, b } = item.vars as { a: number; b: number };
      return q !== undefined && b * q > a && q !== a * b;
    },
  },
  {
    id: 'div-multiplied',
    title: { bn: 'ভাগের বদলে গুণ', en: 'Multiplied instead' },
    explain: {
      bn: 'ভাগ মানে সমান ভাগে ভাগ করা, তাই উত্তর মোটের চেয়ে ছোট হয়। গুণ করার দরকার নেই।',
      en: 'Dividing shares things out, so the answer is smaller than the total. No need to multiply.',
    },
    detect: (item, r) => {
      const { a, b } = item.vars as { a: number; b: number };
      return answer(r, 'q') === a * b;
    },
  },
];
