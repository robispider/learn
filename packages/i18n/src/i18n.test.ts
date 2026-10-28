import { describe, expect, it } from 'vitest';
import {
  bnNumberWords,
  enNumberWords,
  formatNumber,
  groupIndian,
  ordinal,
  parseNumber,
  toBnDigits,
  toSpeech,
  tr,
} from '.';

describe('digits', () => {
  it('converts both ways', () => {
    expect(toBnDigits('12 ÷ 3 = 4')).toBe('১২ ÷ ৩ = ৪');
    expect(parseNumber('১৪')).toBe(14);
    expect(parseNumber('1,00,000')).toBe(100000);
    expect(parseNumber('১২ক')).toBeNaN();
  });
  it('groups the Indian way', () => {
    expect(groupIndian(100000)).toBe('1,00,000');
    expect(groupIndian(12345678)).toBe('1,23,45,678');
    expect(formatNumber(23425, 'bn', { group: true })).toBe('২৩,৪২৫');
  });
});

describe('number words', () => {
  it('reads Bangla numbers like the book', () => {
    expect(bnNumberWords(0)).toBe('শূন্য');
    expect(bnNumberWords(14)).toBe('চৌদ্দ');
    expect(bnNumberWords(99)).toBe('নিরানব্বই');
    expect(bnNumberWords(425)).toBe('চারশত পঁচিশ');
    expect(bnNumberWords(23425)).toBe('তেইশ হাজার চারশত পঁচিশ');
    expect(bnNumberWords(100000)).toBe('এক লক্ষ');
    expect(bnNumberWords(30500)).toBe('ত্রিশ হাজার পাঁচশত');
    expect(bnNumberWords(12345678)).toBe('এক কোটি তেইশ লক্ষ পঁয়তাল্লিশ হাজার ছয়শত আটাত্তর');
  });
  it('reads English numbers with lakh', () => {
    expect(enNumberWords(23425)).toBe('twenty-three thousand four hundred twenty-five');
    expect(enNumberWords(100000)).toBe('one lakh');
  });
  it('has ordinals', () => {
    expect(ordinal(3, 'bn')).toBe('তৃতীয়');
    expect(ordinal(12, 'bn')).toBe('১২তম');
    expect(ordinal(2, 'en')).toBe('2nd');
    expect(ordinal(11, 'en')).toBe('11th');
  });
});

describe('text', () => {
  it('fills slots with localized digits', () => {
    expect(tr({ bn: '{n}টি বিস্কুট', en: '{n} biscuits' }, 'bn', { n: 12 })).toBe('১২টি বিস্কুট');
    expect(tr({ bn: '{n}টি বিস্কুট', en: '{n} biscuits' }, 'en', { n: 12 })).toBe('12 biscuits');
  });
  it('makes speakable text', () => {
    expect(toSpeech('১২ ÷ ৩ = ৪', 'bn')).toBe('বারো ভাগ তিন সমান চার');
    expect(toSpeech('১২টি বিস্কুট আছে।', 'bn')).toBe('বারোটি বিস্কুট আছে।');
    expect(toSpeech('প্রত্যেকে কয়টি করে পাবে?', 'bn')).toBe('প্রত্যেকে কয়টি করে পাবে?');
    expect(toSpeech('14 ÷ 4 = 3, remainder 2', 'en')).toBe(
      'fourteen divided by four equals three, remainder two',
    );
  });
});
