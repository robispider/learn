import { formatNumber, toEnDigits, type Lang } from './digits';
import { numberWords } from './words';

/** A piece of text in both languages. Bangla is required; English may be missing while drafting. */
export type I18n = { bn: string; en?: string };

export function pick(text: I18n | string | undefined, lang: Lang): string {
  if (text === undefined) return '';
  if (typeof text === 'string') return text;
  return lang === 'en' && text.en ? text.en : text.bn;
}

/**
 * Fill `{name}` slots. Numbers are written in the display language's digits.
 * `fill('{n}টি বিস্কুট', { n: 12 }, 'bn')` → "১২টি বিস্কুট".
 */
export function fill(template: string, vars: Record<string, string | number>, lang: Lang): string {
  return template.replace(/\{(\w+)\}/g, (_, k: string) => {
    const v = vars[k];
    if (v === undefined) return `{${k}}`;
    return typeof v === 'number' ? formatNumber(v, lang) : v;
  });
}

/** `pick` + `fill` in one call. */
export function tr(text: I18n | string, lang: Lang, vars: Record<string, string | number> = {}): string {
  return fill(pick(text, lang), vars, lang);
}

const SYMBOL_WORDS: Record<Lang, Record<string, string>> = {
  bn: { '÷': ' ভাগ ', '×': ' গুণ ', '+': ' যোগ ', '−': ' বিয়োগ ', '=': ' সমান ', '☐': ' খালিঘর ' },
  en: { '÷': ' divided by ', '×': ' times ', '+': ' plus ', '−': ' minus ', '=': ' equals ', '☐': ' blank ' },
};

/**
 * Turn display text into what a voice should say: numbers become words and maths symbols become words.
 * "১২ ÷ ৩ = ৪" → "বারো ভাগ তিন সমান চার".
 */
export function toSpeech(text: string, lang: Lang): string {
  let s = toEnDigits(text);
  s = s.replace(/\d+(?:,\d+)*/g, (m) => ` ${numberWords(Number(m.replace(/,/g, '')), lang)} `);
  s = s.replace(/[÷×+−=☐]/g, (m) => SYMBOL_WORDS[lang][m] ?? m);
  // Glue Bangla counter words back on: "বারো টি" → "বারোটি".
  s = s.replace(/ +(টি|জন|টা|তম)/g, '$1');
  return s
    .replace(/\s+/g, ' ')
    .replace(/ ([,।?!])/g, '$1')
    .trim();
}
