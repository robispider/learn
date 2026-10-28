import type { Lang } from '@khelaghor/i18n';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { isMastered, type Attempt } from './mastery';
import { jsonStorage, STORAGE_PREFIX } from './storage';

export type ViewPreference = 'auto' | '2d' | '2.5d' | '3d';

export type Settings = {
  lang: Lang;
  voice: boolean;
  rate: 'slow' | 'normal';
  sfx: boolean;
  reducedMotion: 'system' | 'on' | 'off';
  view: ViewPreference;
};

type SettingsStore = Settings & { set: (patch: Partial<Settings>) => void };

export const useSettings = create<SettingsStore>()(
  persist(
    (set) => ({
      lang: 'bn',
      voice: true,
      rate: 'normal',
      sfx: true,
      reducedMotion: 'system',
      view: 'auto',
      set: (patch) => set(patch),
    }),
    { name: `${STORAGE_PREFIX}settings`, storage: jsonStorage, version: 1 },
  ),
);

export type TopicProgress = {
  explored: boolean;
  tried: boolean;
  attempts: Attempt[];
  mastered: boolean;
  /** Best stars from a practice round (0 until one is finished). */
  bestPractice: number;
  sticker: boolean;
  lastVisit?: number;
};

const emptyTopic = (): TopicProgress => ({
  explored: false,
  tried: false,
  attempts: [],
  mastered: false,
  bestPractice: 0,
  sticker: false,
});

/** Topic stars as shown on cards: one each for Explore, Try and mastering Practice. */
export function topicStars(p: TopicProgress | undefined): number {
  if (!p) return 0;
  return Number(p.explored) + Number(p.tried) + Number(p.mastered);
}

type ProgressStore = {
  /** bookId → topicId → progress */
  books: Record<string, Record<string, TopicProgress>>;
  topic: (bookId: string, topicId: string) => TopicProgress;
  mark: (bookId: string, topicId: string, patch: Partial<TopicProgress>) => void;
  recordAttempt: (bookId: string, topicId: string, attempt: Attempt) => void;
  reset: (bookId?: string) => void;
};

export const useProgress = create<ProgressStore>()(
  persist(
    (set, get) => ({
      books: {},
      topic: (bookId, topicId) => get().books[bookId]?.[topicId] ?? emptyTopic(),
      mark: (bookId, topicId, patch) =>
        set((s) => {
          const book = s.books[bookId] ?? {};
          const prev = book[topicId] ?? emptyTopic();
          return {
            books: {
              ...s.books,
              [bookId]: { ...book, [topicId]: { ...prev, ...patch, lastVisit: Date.now() } },
            },
          };
        }),
      recordAttempt: (bookId, topicId, attempt) => {
        const prev = get().topic(bookId, topicId);
        const attempts = [...prev.attempts, attempt].slice(-30);
        get().mark(bookId, topicId, { attempts, mastered: prev.mastered || isMastered(attempts) });
      },
      reset: (bookId) =>
        set((s) => {
          if (!bookId) return { books: {} };
          const books = { ...s.books };
          delete books[bookId];
          return { books };
        }),
    }),
    { name: `${STORAGE_PREFIX}progress`, storage: jsonStorage, version: 1 },
  ),
);
