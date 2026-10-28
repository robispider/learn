import type { I18n, Lang } from '@khelaghor/i18n';
import type { EqPart } from '@khelaghor/ui';
import type { ComponentType } from 'react';
import type { ZodType } from 'zod';

export type ViewMode = '2d' | '2.5d' | '3d';

export type ToyViewProps<State, Action> = {
  state: State;
  dispatch: (action: Action) => void;
  lang: Lang;
  /** Picture-only: no dragging or tapping (used in practice items and the Learn card). */
  readOnly?: boolean;
};

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
