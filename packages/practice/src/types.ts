import type { Ask, Choose, Level, Rng } from '@khelaghor/core';
import type { I18n } from '@khelaghor/i18n';

/** What the child answered: slot → number for `ask`, option index for `choose`. */
export type Response = { kind: 'ask'; values: Record<string, number> } | { kind: 'choose'; index: number };

/** One generated practice question. */
export type PracticeItem = {
  id: string;
  templateId: string;
  level: Level;
  /** Who reads the question. */
  speaker: string;
  prompt: I18n;
  ask?: Ask;
  choose?: Choose;
  /** A toy picture of the question (rendered read-only by the shell). */
  picture?: { toy: string; config: unknown };
  /** Show the picture from the start (concrete/pictorial level); otherwise it appears with "দেখাও". */
  showPicture: boolean;
  /** Hint ladder: guiding question → look at the picture → worked step. */
  hints: [I18n, I18n, I18n];
  /** Numbers the item was built from, for diagnosis and tests. */
  vars: Record<string, number>;
};

/** Generic practice template. Kits ship these; books pick them per topic. */
export interface PracticeTemplate {
  id: string;
  kit: string;
  title: I18n;
  generate(rng: Rng, level: Level): PracticeItem;
  /** Misconception ids this template can detect. */
  misconceptions?: string[];
}

/** A known wrong idea, its detector, and how to explain it with the picture. */
export interface Misconception {
  id: string;
  title: I18n;
  detect(item: PracticeItem, response: Response): boolean;
  explain: I18n;
}

export type CheckResult = {
  correct: boolean;
  /** Per-slot right/wrong for `ask` items. */
  slots?: Record<string, boolean>;
  misconception?: Misconception;
};
