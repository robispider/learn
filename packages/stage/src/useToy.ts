import { useCallback, useMemo, useReducer } from 'react';
import type { AnyToy } from './toy';

type History<S> = { past: S[]; present: S; future: S[] };
type HistoryAction<A, S> =
  { type: '@do'; action: A } | { type: '@undo' } | { type: '@redo' } | { type: '@reset'; state: S };

/** Runs a toy's pure reducer with undo/redo. `reset(config)` swaps in a fresh state. */
export function useToy<S, A>(toy: AnyToy, config: unknown) {
  const init = useCallback((c: unknown): S => toy.init(toy.configSchema.parse(c)) as S, [toy]);
  const [h, send] = useReducer(
    (h: History<S>, a: HistoryAction<A, S>): History<S> => {
      switch (a.type) {
        case '@do': {
          const next = toy.reducer(h.present, a.action) as S;
          if (next === h.present) return h;
          return { past: [...h.past, h.present].slice(-50), present: next, future: [] };
        }
        case '@undo':
          if (!h.past.length) return h;
          return {
            past: h.past.slice(0, -1),
            present: h.past[h.past.length - 1]!,
            future: [h.present, ...h.future],
          };
        case '@redo':
          if (!h.future.length) return h;
          return { past: [...h.past, h.present], present: h.future[0]!, future: h.future.slice(1) };
        case '@reset':
          return { past: [], present: a.state, future: [] };
      }
    },
    config,
    (c) => ({ past: [], present: init(c), future: [] }),
  );
  const dispatch = useCallback((action: A) => send({ type: '@do', action }), []);
  return useMemo(
    () => ({
      state: h.present,
      dispatch,
      undo: () => send({ type: '@undo' }),
      redo: () => send({ type: '@redo' }),
      reset: (c: unknown = config) => send({ type: '@reset', state: init(c) }),
      canUndo: h.past.length > 0,
      canRedo: h.future.length > 0,
    }),
    [h, dispatch, init, config],
  );
}
