// Plain data only (no React, no CSS), so tooling can import it for validation and the Bangla review export.
import { kitStrings } from '@khelaghor/kit-operations/strings';
import ch06 from './chapters/ch06.json';
import glossary from './glossary.json';

type Stub = {
  no: number;
  bn: string;
  en: string;
  pages: [number, number];
  place: string;
  placeEn: string;
  art: string;
};

// Chapters not built yet: on the map and in page search, with no topics.
const stubs: Stub[] = [
  {
    no: 1,
    bn: 'সংখ্যা',
    en: 'Numbers',
    pages: [1, 20],
    place: 'সংখ্যার হাট',
    placeEn: 'Number Haat',
    art: '🏪',
  },
  {
    no: 2,
    bn: 'যোগ',
    en: 'Addition',
    pages: [21, 30],
    place: 'যোগের ঘাট',
    placeEn: 'Addition Ghat',
    art: '⛵',
  },
  {
    no: 3,
    bn: 'বিয়োগ',
    en: 'Subtraction',
    pages: [31, 36],
    place: 'বিয়োগের ঘাট',
    placeEn: 'Subtraction Ghat',
    art: '🛶',
  },
  {
    no: 4,
    bn: 'যোগ ও বিয়োগের সম্পর্ক',
    en: 'Addition and subtraction',
    pages: [37, 41],
    place: 'যোগ-বিয়োগের সাঁকো',
    placeEn: 'Bamboo Bridge',
    art: '🌉',
  },
  {
    no: 5,
    bn: 'গুণ',
    en: 'Multiplication',
    pages: [42, 62],
    place: 'গুণের বাগান',
    placeEn: 'Mango Orchard',
    art: '🥭',
  },
  {
    no: 7,
    bn: 'গুণ ও ভাগের সম্পর্ক',
    en: 'Multiplication and division',
    pages: [78, 83],
    place: 'নামতার মাচা',
    placeEn: 'Times-table Loft',
    art: '🍽️',
  },
  {
    no: 8,
    bn: 'যোগ, বিয়োগ, গুণ ও ভাগসংক্রান্ত সমস্যা',
    en: 'Word problems',
    pages: [84, 90],
    place: 'বাজার',
    placeEn: 'Market',
    art: '🛒',
  },
  {
    no: 9,
    bn: 'ভগ্নাংশ',
    en: 'Fractions',
    pages: [91, 106],
    place: 'পিঠা ঘর',
    placeEn: 'Pitha Bakery',
    art: '🥧',
  },
  {
    no: 10,
    bn: 'বাংলাদেশি মুদ্রা',
    en: 'Bangladeshi money',
    pages: [107, 117],
    place: 'টাকার বাজার',
    placeEn: 'Money Bazar',
    art: '💰',
  },
  {
    no: 11,
    bn: 'পরিমাপ',
    en: 'Measurement',
    pages: [118, 132],
    place: 'মাপের মেলা',
    placeEn: 'Measurement Mela',
    art: '🎡',
  },
  {
    no: 12,
    bn: 'জ্যামিতি',
    en: 'Geometry',
    pages: [133, 148],
    place: 'জ্যামিতির বাগান',
    placeEn: 'Geometry Garden',
    art: '🔷',
  },
  {
    no: 13,
    bn: 'উপাত্ত সংগ্রহ ও বিন্যস্তকরণ',
    en: 'Collecting and arranging data',
    pages: [149, 155],
    place: 'শিশুপার্ক',
    placeEn: "Children's Park",
    art: '🎠',
  },
];

const stubChapter = (s: Stub) => ({
  id: `ch${String(s.no).padStart(2, '0')}`,
  no: s.no,
  title: { bn: s.bn, en: s.en },
  bookPages: s.pages,
  place: { name: { bn: s.place, en: s.placeEn }, art: s.art },
  topics: [],
  upcoming: [],
});

export const bookData = {
  id: 'c3-math',
  class: 3,
  subject: 'math',
  title: { bn: 'তৃতীয় শ্রেণির গণিত খেলাঘর', en: 'Class 3 Math Khelaghor' },
  shortTitle: { bn: 'গণিত খেলাঘর', en: 'Math Khelaghor' },
  source: { publisher: 'NCTB', edition: '2025', pageOffset: 6 },
  characters: [
    { id: 'rafi', name: { bn: 'রাফি', en: 'Rafi' }, bubble: 'yellow' },
    { id: 'tuli', name: { bn: 'তুলি', en: 'Tuli' }, bubble: 'pink' },
    { id: 'tia', name: { bn: 'টিয়া', en: 'Tia' }, bubble: 'blue' },
  ],
  companion: 'tia',
  // The book's own activity symbols (p.5).
  modeSymbols: {
    explore: { symbol: '❓', name: { bn: 'মূল প্রশ্ন', en: 'Main question' } },
    try: { symbol: '▲', name: { bn: 'কাজ', en: 'Activity' } },
    practice: { symbol: '■', name: { bn: 'অনুশীলন', en: 'Practice' } },
    // Not a book symbol: the app's free-play lab.
    lab: { symbol: '🎛️', name: { bn: 'বদলে দেখি', en: 'Experiment' } },
    challenge: { symbol: '●', name: { bn: 'নিজে করি', en: 'On my own' } },
    learn: { symbol: '📘', name: { bn: 'শিখি', en: 'Learn' } },
  },
  stickers: [
    { id: 'mango', name: { bn: 'আম', en: 'Mango' } },
    { id: 'kite', name: { bn: 'ঘুড়ি', en: 'Kite' } },
    { id: 'boat', name: { bn: 'নৌকা', en: 'Boat' } },
    { id: 'shapla', name: { bn: 'শাপলা', en: 'Water lily' } },
  ],
  glossary,
  chapters: [
    ...stubs.filter((s) => s.no < 6).map(stubChapter),
    ch06,
    ...stubs.filter((s) => s.no > 6).map(stubChapter),
  ],
};

/** Strings shown by the kits this book uses (for the review export). */
export const bookStrings = { kit: { operations: kitStrings } };
