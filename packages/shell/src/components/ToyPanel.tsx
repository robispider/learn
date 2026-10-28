import { useSettings } from '@khelaghor/core';
import { availableViews, chooseView, ToyHost, useCapability, useToy, type ViewMode } from '@khelaghor/stage';
import { EquationChips, IconButton } from '@khelaghor/ui';
import { useEffect, useRef, type ReactNode } from 'react';
import { useBook } from '../book';
import { useLang, useT } from '../hooks';
import { S } from '../strings';

const VIEW_LABEL = { '2d': S.view2d, '2.5d': S.view25d, '3d': S.view3d } as const;

/**
 * The lesson stage: a toy with its toolbar (undo · redo · restart · 2D|2.5D), its controls and the live
 * number sentence. `config` changes reset the toy; `onState` reports every new state to the caller.
 */
export function ToyPanel({
  toyId,
  config,
  onState,
  readOnly,
  equation = true,
  toolbar = true,
  aside,
}: {
  toyId: string;
  config: unknown;
  onState?: (state: unknown) => void;
  readOnly?: boolean;
  equation?: boolean;
  toolbar?: boolean;
  aside?: ReactNode;
}) {
  const book = useBook();
  const lang = useLang();
  const t = useT();
  const toy = book.toy(toyId);
  const h = useToy<unknown, unknown>(toy, config);
  const cap = useCapability();
  const pref = useSettings((s) => s.view);
  const setSettings = useSettings((s) => s.set);
  const views = availableViews(toy);
  const view = chooseView(views, cap, pref);
  const offered = views.filter((v) => v === '2d' || chooseView(views, cap, v) === v);

  // New config (next step / next item) → fresh toy.
  const key = JSON.stringify(config);
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    h.reset(config);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  useEffect(() => {
    onState?.(h.state);
  }, [h.state, onState]);

  const Controls = toy.controls;
  return (
    <div className="kg-toy">
      <div className="kg-stage" data-view={view}>
        <ToyHost
          toy={toy}
          state={h.state}
          dispatch={h.dispatch}
          view={view}
          lang={lang}
          readOnly={readOnly}
          onFallback={() => setSettings({ view: '2d' })}
        />
        {aside}
      </div>
      {toolbar && !readOnly && (
        <div className="kg-toolbar" role="toolbar">
          <IconButton label={t(S.undo)} onClick={h.undo} disabled={!h.canUndo}>
            ⟲
          </IconButton>
          <IconButton label={t(S.redo)} onClick={h.redo} disabled={!h.canRedo}>
            ⟳
          </IconButton>
          {offered.length > 1 && (
            <div className="kg-segment" role="group" aria-label={t(S.view)}>
              {offered.map((v: ViewMode) => (
                <button
                  key={v}
                  type="button"
                  aria-pressed={view === v}
                  onClick={() => setSettings({ view: v })}
                >
                  {t(VIEW_LABEL[v])}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
      {Controls && <Controls state={h.state} dispatch={h.dispatch} lang={lang} readOnly={readOnly} />}
      {equation && toy.toEquation && (
        <div className="kg-equation">
          <EquationChips parts={toy.toEquation(h.state, lang)} lang={lang} />
        </div>
      )}
    </div>
  );
}
