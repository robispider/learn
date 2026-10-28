import type { I18n } from '@khelaghor/i18n';

export const RUSH_STRINGS = {
  title: { bn: 'প্লেট ভাগের দৌড়', en: 'Plate Dealer Rush' },
  howTo: {
    bn: 'প্লেটে ট্যাপ করে একটি একটি করে দাও। সবাই সমান পাবে! ৬০ সেকেন্ডে কতগুলো ভাগ শেষ করতে পারো?',
    en: 'Tap the plates to give one at a time. Everyone gets the same! How many shares can you finish in 60 seconds?',
  },
  start: { bn: 'শুরু করি!', en: 'Start!' },
  time: { bn: 'সময় {t}', en: 'Time {t}' },
  score: { bn: 'ভাগ শেষ {n}', en: 'Shares {n}' },
  over: { bn: 'সময় শেষ! তুমি {n}টি ভাগ শেষ করেছ।', en: "Time's up! You finished {n} shares." },
  again: { bn: 'আবার খেলি', en: 'Play again' },
  done: { bn: 'শেষ', en: 'Done' },
} satisfies Record<string, I18n>;
