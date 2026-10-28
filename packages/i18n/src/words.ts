import type { Lang } from './digits';

// 0–99 in Bangla are irregular, so they are listed in full.
// prettier-ignore
const BN_0_99 = [
  'শূন্য', 'এক', 'দুই', 'তিন', 'চার', 'পাঁচ', 'ছয়', 'সাত', 'আট', 'নয়',
  'দশ', 'এগারো', 'বারো', 'তেরো', 'চৌদ্দ', 'পনেরো', 'ষোলো', 'সতেরো', 'আঠারো', 'উনিশ',
  'বিশ', 'একুশ', 'বাইশ', 'তেইশ', 'চব্বিশ', 'পঁচিশ', 'ছাব্বিশ', 'সাতাশ', 'আটাশ', 'ঊনত্রিশ',
  'ত্রিশ', 'একত্রিশ', 'বত্রিশ', 'তেত্রিশ', 'চৌত্রিশ', 'পঁয়ত্রিশ', 'ছত্রিশ', 'সাঁইত্রিশ', 'আটত্রিশ', 'ঊনচল্লিশ',
  'চল্লিশ', 'একচল্লিশ', 'বিয়াল্লিশ', 'তেতাল্লিশ', 'চুয়াল্লিশ', 'পঁয়তাল্লিশ', 'ছেচল্লিশ', 'সাতচল্লিশ', 'আটচল্লিশ', 'ঊনপঞ্চাশ',
  'পঞ্চাশ', 'একান্ন', 'বায়ান্ন', 'তিপ্পান্ন', 'চুয়ান্ন', 'পঞ্চান্ন', 'ছাপ্পান্ন', 'সাতান্ন', 'আটান্ন', 'ঊনষাট',
  'ষাট', 'একষট্টি', 'বাষট্টি', 'তেষট্টি', 'চৌষট্টি', 'পঁয়ষট্টি', 'ছেষট্টি', 'সাতষট্টি', 'আটষট্টি', 'ঊনসত্তর',
  'সত্তর', 'একাত্তর', 'বাহাত্তর', 'তিয়াত্তর', 'চুয়াত্তর', 'পঁচাত্তর', 'ছিয়াত্তর', 'সাতাত্তর', 'আটাত্তর', 'ঊনআশি',
  'আশি', 'একাশি', 'বিরাশি', 'তিরাশি', 'চুরাশি', 'পঁচাশি', 'ছিয়াশি', 'সাতাশি', 'অষ্টাশি', 'ঊননব্বই',
  'নব্বই', 'একানব্বই', 'বিরানব্বই', 'তিরানব্বই', 'চুরানব্বই', 'পঁচানব্বই', 'ছিয়ানব্বই', 'সাতানব্বই', 'আটানব্বই', 'নিরানব্বই',
];

/** Bangla number words with lakh/crore: 23425 → "তেইশ হাজার চারশত পঁচিশ". */
export function bnNumberWords(n: number): string {
  if (!Number.isInteger(n)) throw new Error(`bnNumberWords: not an integer: ${n}`);
  if (n < 0) return `ঋণাত্মক ${bnNumberWords(-n)}`;
  if (n < 100) return BN_0_99[n]!;
  const parts: string[] = [];
  const crore = Math.floor(n / 1_00_00_000);
  let rest = n % 1_00_00_000;
  if (crore) parts.push(`${bnNumberWords(crore)} কোটি`);
  const units: [number, string][] = [
    [1_00_000, 'লক্ষ'],
    [1000, 'হাজার'],
    [100, 'শত'],
  ];
  for (const [size, word] of units) {
    const k = Math.floor(rest / size);
    rest %= size;
    if (!k) continue;
    // "শত" joins its number: চারশত, not চার শত.
    parts.push(size === 100 ? `${BN_0_99[k]}${word}` : `${BN_0_99[k]} ${word}`);
  }
  if (rest) parts.push(BN_0_99[rest]!);
  return parts.join(' ');
}

// prettier-ignore
const EN_0_19 = [
  'zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine',
  'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen',
];
const EN_TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

/** English number words with lakh/crore grouping, to match the Bangla book. */
export function enNumberWords(n: number): string {
  if (!Number.isInteger(n)) throw new Error(`enNumberWords: not an integer: ${n}`);
  if (n < 0) return `minus ${enNumberWords(-n)}`;
  if (n < 20) return EN_0_19[n]!;
  if (n < 100) return EN_TENS[Math.floor(n / 10)]! + (n % 10 ? `-${EN_0_19[n % 10]}` : '');
  const units: [number, string][] = [
    [1_00_00_000, 'crore'],
    [1_00_000, 'lakh'],
    [1000, 'thousand'],
    [100, 'hundred'],
  ];
  const parts: string[] = [];
  let rest = n;
  for (const [size, word] of units) {
    const k = Math.floor(rest / size);
    rest %= size;
    if (k) parts.push(`${enNumberWords(k)} ${word}`);
  }
  if (rest) parts.push(enNumberWords(rest));
  return parts.join(' ');
}

export function numberWords(n: number, lang: Lang): string {
  return lang === 'bn' ? bnNumberWords(n) : enNumberWords(n);
}

const BN_ORDINALS = [
  'প্রথম',
  'দ্বিতীয়',
  'তৃতীয়',
  'চতুর্থ',
  'পঞ্চম',
  'ষষ্ঠ',
  'সপ্তম',
  'অষ্টম',
  'নবম',
  'দশম',
];

/** 1 → প্রথম / 1st. Bangla beyond 10 uses the digit form (১১তম). */
export function ordinal(n: number, lang: Lang): string {
  if (lang === 'bn') {
    if (n >= 1 && n <= 10) return BN_ORDINALS[n - 1]!;
    return String(n).replace(/[0-9]/g, (d) => '০১২৩৪৫৬৭৮৯'[Number(d)]!) + 'তম';
  }
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] ?? s[v] ?? s[0]!);
}
