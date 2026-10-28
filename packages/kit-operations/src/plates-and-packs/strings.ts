import type { ItemKind } from '@khelaghor/art';
import type { I18n } from '@khelaghor/i18n';

/** Every string this toy shows. Exported for the Bangla review file. */
export const ITEM_NAMES: Record<ItemKind, I18n> = {
  biscuit: { bn: 'বিস্কুট', en: 'biscuits' },
  orange: { bn: 'কমলালেবু', en: 'oranges' },
  lemon: { bn: 'লেবু', en: 'lemons' },
  chocolate: { bn: 'চকলেট', en: 'chocolates' },
};

export const S = {
  title: { bn: 'প্লেট ও প্যাকেট', en: 'Plates & Packs' },
  dealRound: { bn: 'একবার করে দাও', en: 'Give one to each' },
  makePack: { bn: '{n}টি করে প্যাকেট করো', en: 'Make a pack of {n}' },
  restart: { bn: 'আবার শুরু', en: 'Start again' },
  pile: { bn: 'স্তূপ', en: 'pile' },

  shareProgress: { bn: 'প্রত্যেকে {n}টি করে, বাকি {p}টি', en: 'Each has {n}, {p} left' },
  shareStart: { bn: 'প্লেটে ট্যাপ করো বা টেনে দাও', en: 'Tap a plate or drag one over' },
  unfair: { bn: 'এখনও সবাই সমান পায়নি!', en: 'Not fair yet!' },
  shareDone: { bn: 'প্রত্যেকে {n}টি করে পেল!', en: 'Each child got {n}!' },
  shareDoneLeft: {
    bn: 'প্রত্যেকে {n}টি করে পেল, {r}টি অবশিষ্ট রইল।',
    en: 'Each child got {n}, and {r} are left over.',
  },
  shareNotEnough: { bn: 'সবাইকে আরেকটি করে দেওয়ার মতো নেই!', en: 'Not enough to give everyone one more!' },

  groupProgress: { bn: '{k} জন পেল, বাকি {p}টি', en: '{k} children got a pack, {p} left' },
  groupStart: { bn: 'প্যাকেট বানাও', en: 'Make the packs' },
  groupDone: { bn: '{k} জনকে দেওয়া গেল!', en: '{k} children got a pack!' },
  groupDoneLeft: {
    bn: '{k} জনকে দেওয়া গেল, {r}টি অবশিষ্ট রইল।',
    en: '{k} children got a pack, and {r} are left over.',
  },
  groupNotEnough: { bn: 'আরেকটি প্যাকেট ভরার মতো নেই!', en: 'Not enough to fill another pack!' },
  packFull: { bn: 'এই প্যাকেট ভরে গেছে।', en: 'This pack is full.' },

  editTotal: { bn: 'মোট', en: 'Total' },
  editPlates: { bn: 'শিশু', en: 'Children' },
  editSize: { bn: 'প্রত্যেককে', en: 'Each gets' },
  more: { bn: 'বাড়াও', en: 'more' },
  less: { bn: 'কমাও', en: 'fewer' },

  // Equation chip labels.
  leftWord: { bn: 'অবশিষ্ট', en: 'remainder' },
  shareLabels: {
    dividend: { bn: 'বস্তু', en: 'things' },
    divisor: { bn: 'শিশু', en: 'children' },
    quotient: { bn: 'প্রত্যেকের ভাগ', en: 'each gets' },
  },
  groupLabels: {
    dividend: { bn: 'মোট {item}', en: 'total {item}' },
    divisor: { bn: 'প্রত্যেকের {item}', en: '{item} each' },
    quotient: { bn: 'মোট শিশু', en: 'children' },
  },
  terms: {
    dividend: { bn: 'ভাজ্য', en: 'dividend' },
    divisor: { bn: 'ভাজক', en: 'divisor' },
    quotient: { bn: 'ভাগফল', en: 'quotient' },
    remainder: { bn: 'ভাগশেষ', en: 'remainder' },
  },
} satisfies Record<string, I18n | Record<string, I18n>>;
