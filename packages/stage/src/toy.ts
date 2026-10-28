import type { I18n, Lang } from '@khelaghor/i18n';
import type { EqPart } from '@khelaghor/ui';
import type { ComponentType, ReactNode } from 'react';
import type { ZodType } from 'zod';

export type ViewMode = '2d' | '2.5d' | '3d';

export type ToyViewProps<State, Action> = {
  state: State;
  dispatch: (action: Action) => void;
  lang: Lang;
  /** Picture-only: no dragging or tapping (used in practice items and the Learn card). */
  readOnly?: boolean;
};

/** A setting the child can change on a part ("change an element"): a number or a pick from a few. */
export type ToyKnob<Action> =
  | {
      kind: 'number';
      id: string;
      label: I18n;
      value: number;
      min: number;
      max: number;
      action: (value: number) => Action;
    }
  | {
      kind: 'choice';
      id: string;
      label: I18n;
      value: string;
      options: { value: string; label: I18n; icon?: ReactNode }[];
      action: (value: string) => Action;
    };

/**
 * A named part of the toy scene (the pile, the plates…). Renderers mark where it is with an anchor
 * (`SvgAnchor` / `Anchor3D`) of the same `id`; the stage draws a callout there that opens an inspector.
 */
export type ToyPart<Action> = {
  id: string;
  icon?: string;
  title: I18n;
  note: I18n;
  knobs?: ToyKnob<Action>[];
};

/** One line of the "math language" panel: a number sentence and an optional comment. */
export type EqLine = { parts: EqPart[]; note?: string };

/**
 * The toy contract (plan/04-packages-and-kits.md). A lesson only says which toy, which config and
 * which steps; everything else lives here, so every book reuses the same toy with different settings.
 */
export interface ToyDefinition<State = unknown, Config = unknown, Action = unknown> {
  id: string;
  kit: string;
  title: I18n;
  configSchema: ZodType<Config>;
  /** Accepts raw config; it is parsed with `configSchema` first. */
  init(config: Config): State;
  /** Pure, so undo/redo and replay work. */
  reducer(state: State, action: Action): State;
  renderers: {
    '2d': ComponentType<ToyViewProps<State, Action>>;
    '2.5d'?: ComponentType<ToyViewProps<State, Action>>;
    '3d'?: ComponentType<ToyViewProps<State, Action>>;
  };
  /** Buttons and readouts shown under the stage (same for every view). */
  controls?: ComponentType<ToyViewProps<State, Action>>;
  /** Live number sentence mirroring the state. */
  toEquation?(state: State, lang: Lang): EqPart[];
  /** Does the state meet a step's `expect`? */
  check?(state: State, expect: unknown): boolean;
  /** Validates a step's `expect` at build time. */
  expectSchema?: ZodType<unknown>;
  /** Short status line for screen readers. */
  describe?(state: State, lang: Lang): string;
  /** Parts with callouts and knobs, for exploring and experimenting. */
  parts?(state: State, lang: Lang): ToyPart<Action>[];
  /** The live "math language" lines (defaults to `toEquation`). */
  explain?(state: State, lang: Lang): EqLine[];
  /** Start over but keep what the child changed with the knobs (restart, replay). */
  clear?: Action;
  /** ▶ Play: the next action to show the idea step by step, or null when there is nothing left. */
  autoplay?(state: State): Action | null;
  /** How to play with it, shown as tips in the lesson panel. */
  tips?: I18n[];
  /** Small picture for lesson cards. */
  thumbnail?: ComponentType<{ config: Config }>;
}

// The registry stores toys with their types erased; `ToyHost` keeps state and actions paired.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyToy = ToyDefinition<any, any, any>;

export function defineToy<S, C, A>(def: ToyDefinition<S, C, A>): ToyDefinition<S, C, A> {
  return def;
}

export function availableViews(toy: AnyToy): ViewMode[] {
  return (['2d', '2.5d', '3d'] as const).filter((v) => !!toy.renderers[v]);
}

export type GameProps = {
  lang: Lang;
  /** Called once when a round ends. */
  onFinish: (result: { score: number; stars: 1 | 2 | 3 }) => void;
};

/** A 60–90 second mini-game that drills one skill with a kit toy. */
export interface GameDefinition {
  id: string;
  kit: string;
  title: I18n;
  howTo: I18n;
  component: ComponentType<GameProps>;
}
