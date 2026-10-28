import type { Lang } from '@khelaghor/i18n';
import { Component, Suspense, type ReactNode } from 'react';
import type { AnyToy, ViewMode } from './toy';

class Fallback extends Component<
  { fallback: ReactNode; children: ReactNode; onError?: (e: unknown) => void },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(e: unknown) {
    this.props.onError?.(e);
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

/**
 * Renders a toy in the requested view. 2.5-D/3-D renderers are lazy; while they load, or if WebGL
 * fails, the required 2-D renderer is shown instead, so a lesson always works.
 */
export function ToyHost<S, A>({
  toy,
  state,
  dispatch,
  view,
  lang,
  readOnly,
  onFallback,
}: {
  toy: AnyToy;
  state: S;
  dispatch: (a: A) => void;
  view: ViewMode;
  lang: Lang;
  readOnly?: boolean;
  onFallback?: (e: unknown) => void;
}) {
  const Flat = toy.renderers['2d'];
  const flat = <Flat state={state} dispatch={dispatch} lang={lang} readOnly={readOnly} />;
  const Rich = view === '2d' ? undefined : toy.renderers[view];
  if (!Rich) return flat;
  return (
    <Fallback fallback={flat} onError={onFallback} key={view}>
      <Suspense fallback={flat}>
        <Rich state={state} dispatch={dispatch} lang={lang} readOnly={readOnly} />
      </Suspense>
    </Fallback>
  );
}
