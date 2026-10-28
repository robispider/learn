import { z } from 'zod';

/** Text in both languages; Bangla required. */
export const I18nSchema = z.object({ bn: z.string().min(1), en: z.string().optional() });

export const PoseSchema = z.enum(['idle', 'think', 'point', 'cheer', 'wave', 'sad', 'surprised']);
export const ExpressionSchema = z.enum(['happy', 'curious', 'worried', 'proud']);

/** One line of character dialogue. */
export const LineSchema = z.object({
  say: z.string(),
  text: I18nSchema,
  pose: PoseSchema.optional(),
  expression: ExpressionSchema.optional(),
});

export const ChipColorSchema = z.enum(['dividend', 'divisor', 'quotient', 'remainder', 'plain']);

/**
 * Fill-the-boxes question. `template` is a sentence where `[slot]` marks a box to fill,
 * e.g. "১৪ ÷ ৪ = [q], ভাগশেষ [r]"; `answers` holds the right number per slot.
 */
export const AskSchema = z.object({
  template: I18nSchema,
  answers: z.record(z.string(), z.number().int()),
  labels: z.record(z.string(), I18nSchema).optional(),
  colors: z.record(z.string(), ChipColorSchema).optional(),
});

/** Multiple choice; options are shown with the book's ক/খ/গ/ঘ markers. */
export const ChooseSchema = z.object({
  options: z.array(I18nSchema).min(2).max(4),
  answer: z.number().int().min(0),
  /** Optional reply per option, said when that option is picked. */
  replies: z.array(I18nSchema.nullable()).optional(),
});

/**
 * A guided step. With `expect` the child must bring the toy to that state (checked by the toy);
 * with `ask` or `choose` they answer; with neither it is a "next" step.
 */
export const StepSchema = z.object({
  say: z.string().default('tia'),
  pose: PoseSchema.optional(),
  expression: ExpressionSchema.optional(),
  text: I18nSchema,
  /** Replace the toy with this config before the step starts. */
  setup: z.unknown().optional(),
  expect: z.unknown().optional(),
  ask: AskSchema.optional(),
  choose: ChooseSchema.optional(),
  hints: z.array(I18nSchema).max(3).optional(),
  /** What the speaker says when the step is done. */
  success: I18nSchema.optional(),
});

export const ToyBlockSchema = z.object({
  toy: z.string(),
  config: z.unknown(),
});

/** A lab challenge: a Try-style step with a title and a difficulty, for "change it and see". */
export const ChallengeSchema = StepSchema.extend({
  id: z.string(),
  title: I18nSchema,
  level: z.number().int().min(1).max(3),
});

export const TopicSchema = z.object({
  id: z.string(),
  title: I18nSchema,
  /** The book's মূল প্রশ্ন. */
  question: I18nSchema,
  bookPages: z.tuple([z.number().int(), z.number().int()]),
  phase: z.number().int().min(0).max(4),
  sticker: z.string(),
  learn: z.object({
    rule: I18nSchema,
    example: I18nSchema.optional(),
    vocab: z.array(z.string()),
  }),
  explore: ToyBlockSchema.extend({
    hook: z.array(LineSchema).min(1),
    /** Toy state that counts as "explored" (e.g. the pile is shared out). */
    goal: z.unknown().optional(),
    done: I18nSchema.optional(),
  }),
  try: z
    .array(ToyBlockSchema.extend({ title: I18nSchema.optional(), steps: z.array(StepSchema).min(1) }))
    .min(1),
  /** 🎛️ Experiment: free play with knobs, plus challenges that add complexity step by step. */
  lab: ToyBlockSchema.extend({ challenges: z.array(ChallengeSchema).default([]) }).optional(),
  practice: z.object({
    templates: z.array(z.object({ id: z.string(), weight: z.number().positive().default(1) })).min(1),
    count: z.number().int().min(3).max(20).default(8),
    misconceptions: z.array(z.string()).default([]),
  }),
  game: z.string().optional(),
});

export const TopicStubSchema = z.object({
  id: z.string(),
  title: I18nSchema,
  bookPages: z.tuple([z.number(), z.number()]),
});

export const ChapterSchema = z.object({
  id: z.string(),
  no: z.number().int(),
  title: I18nSchema,
  bookPages: z.tuple([z.number().int(), z.number().int()]),
  place: z.object({ name: I18nSchema, art: z.string() }),
  topics: z.array(TopicSchema),
  upcoming: z.array(TopicStubSchema).default([]),
});

export const GlossaryEntrySchema = z.object({
  id: z.string(),
  bn: z.string(),
  en: z.string(),
  definition: I18nSchema.optional(),
  chapter: z.number().int(),
  bookPage: z.number().int().optional(),
});

export const CharacterRefSchema = z.object({
  id: z.string(),
  name: I18nSchema,
  /** Speech-box colour token, e.g. 'yellow' for Rafi as in the book. */
  bubble: z.enum(['yellow', 'pink', 'blue', 'lavender', 'green']),
});

export const ModeSchema = z.enum(['explore', 'try', 'lab', 'practice', 'learn', 'challenge']);

export const BookSchema = z.object({
  id: z.string(),
  class: z.number().int().min(1).max(12),
  subject: z.string(),
  title: I18nSchema,
  shortTitle: I18nSchema,
  source: z.object({ publisher: z.string(), edition: z.string(), pageOffset: z.number().int() }),
  characters: z.array(CharacterRefSchema),
  companion: z.string(),
  modeSymbols: z.record(ModeSchema, z.object({ symbol: z.string(), name: I18nSchema })),
  stickers: z.array(z.object({ id: z.string(), name: I18nSchema })),
  glossary: z.array(GlossaryEntrySchema),
  chapters: z.array(ChapterSchema),
});

export type I18nText = z.infer<typeof I18nSchema>;
export type Pose = z.infer<typeof PoseSchema>;
export type Expression = z.infer<typeof ExpressionSchema>;
export type Line = z.infer<typeof LineSchema>;
export type Ask = z.infer<typeof AskSchema>;
export type Choose = z.infer<typeof ChooseSchema>;
export type Step = z.infer<typeof StepSchema>;
export type Challenge = z.infer<typeof ChallengeSchema>;
export type Topic = z.infer<typeof TopicSchema>;
export type TopicStub = z.infer<typeof TopicStubSchema>;
export type Chapter = z.infer<typeof ChapterSchema>;
export type GlossaryEntry = z.infer<typeof GlossaryEntrySchema>;
export type CharacterRef = z.infer<typeof CharacterRefSchema>;
export type Mode = z.infer<typeof ModeSchema>;
export type BookData = z.infer<typeof BookSchema>;
