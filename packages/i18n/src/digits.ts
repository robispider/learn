const BN_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];

export type Lang = 'bn' | 'en';

/** Replace every ASCII digit in `text` with its Bangla digit. */
export function toBnDigits(text: string | number): string {
  return String(text).replace(/[0-9]/g, (d) => BN_DIGITS[Number(d)]!);
}

/** Replace every Bangla digit in `text` with its ASCII digit. */
export function toEnDigits(text: string): string {
  return text.replace(/[০-৯]/g, (d) => String(BN_DIGITS.indexOf(d)));
}

/** Indian (lakh/crore) grouping: 1234567 → "12,34,567". */
export function groupIndian(n: number): string {
  const sign = n < 0 ? '-' : '';
  const s = String(Math.trunc(Math.abs(n)));
  if (s.length <= 3) return sign + s;
  const last3 = s.slice(-3);
  const rest = s.slice(0, -3).replace(/\B(?=(\d{2})+(?!\d))/g, ',');
  return `${sign}${rest},${last3}`;
}

/** Format a number for display: Bangla digits in bn, Indian grouping when `group` is set. */
export function formatNumber(n: number, lang: Lang, opts: { group?: boolean } = {}): string {
  const s = opts.group ? groupIndian(n) : String(n);
  return lang === 'bn' ? toBnDigits(s) : s;
}

/** Parse a number typed in either digit system. Returns NaN when it is not a whole number. */
export function parseNumber(text: string): number {
  const s = toEnDigits(text).replace(/,/g, '').trim();
  return /^-?\d+$/.test(s) ? Number(s) : NaN;
}
