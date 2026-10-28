import { useSettings } from '@khelaghor/core';
import { formatNumber, type Lang } from '@khelaghor/i18n';
import {
  availableViews,
  chooseView,
  ToyHost,
  useCapability,
  useToy,
  type AnyToy,
  type EqLine,
  type ViewMode,
} from '@khelaghor/stage';
import { EquationChips, IconButton } from '@khelaghor/ui';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useBook } from '../book';
import { useLang, useT } from '../hooks';
import { S } from '../strings';
import { Slot, useWb } from './context';
import { StageOverlay } from './StageOverlay';

const VIEW_LABEL = { '2d': S.view2d, '2.5d': S.view25d, '3d': S.view3d } as const;

/**
 * A toy for one lesson area. A new `config` (or `resetKey`) starts it fresh. Modes that show the toy's
 * knobs in their panel (the lab) hold this themselves and pass it to `ToyStage`.
 */
export function useLessonToy(toyId: string, config: unknown, resetKey?: string) {
  const book = useBook();
  const toy = book.toy(toyId);
  const h = useToy<unknown, unknown>(toy, config);
  const key = `${resetKey ?? ''}|${JSON.stringify(config)}`;
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    h.reset(config);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  /** Start over, keeping knob changes when the toy supports it. */
  const restart = () => (toy.clear !== undefined ? h.dispatch(toy.clear) : h.reset(config));
  return { toy, config, ...h, restart };
}
export type LessonToy = ReturnType<typeof useLessonToy>;

/** ▶ Play: step the toy with its own `autoplay` until it says there is nothing left. */
function useAutoplay(lt: LessonToy, autoStart: boolean) {
  const [playing, setPlaying] = useState(autoStart);
  const { toy, state, dispatch } = lt;
  useEffect(() => {
    if (!playing || !toy.autoplay) return;
    const id = setTimeout(() => {
      const a = toy.autoplay!(state);
      if (a === null) setPlaying(false);
      else dispatch(a);
    }, 650);
    return () => clearTimeout(id);
  }, [playing, state, toy, dispatch]);
  const canPlay = !!toy.autoplay;
  const start = () => {
    // Already finished: start over, then play.
    if (toy.autoplay?.(state) === null) lt.restart();
    setPlaying(true);
  };
  return { playing, canPlay, start, stop: () => setPlaying(false) };
}

function MathCode({
  lines,
  lang,
  play,
  onRestart,
}: {
  lines: EqLine[];
  lang: Lang;
  play: ReturnType<typeof useAutoplay>;
  onRestart?: () => void;
}) {
  const t = useT();
  return (
    <section className="kg-code" aria-label={t(S.mathCode)}>
      <header className="kg-code__head">
        <span className="kg-kicker">✏️ {t(S.mathCode)}</span>
        {onRestart && (
          <IconButton label={t(S.restart)} onClick={onRestart}>
            ↺
          </IconButton>
        )}
        {play.canPlay && (
          <button
            type="button"
            className="kg-code__run"
            aria-pressed={play.playing}
            onClick={play.playing ? play.stop : play.start}
          >
            {play.playing ? `⏸ ${t(S.pause)}` : `▶ ${t(S.playIt)}`}
          </button>
        )}
      </header>
      <ol className="kg-code__lines">
        {lines.map((l, i) => (
          <li key={i}>
            <span className="kg-code__no" aria-hidden>
              {formatNumber(i + 1, lang)}
            </span>
            {l.parts.length > 0 && <EquationChips parts={l.parts} lang={lang} />}
            {l.note && <span className="kg-code__note">{`// ${l.note}`}</span>}
          </li>
        ))}
      </ol>
    </section>
  );
}

/**
 * The lesson stage: the toy on a drawing-board canvas with callouts, a floating toolbar
 * (undo · redo · restart · 2D|2.5D · labels · hint), the toy's own controls, and its live
 * "math language" lines in the side panel's code box.
 */
export function ToyStage({
  lt,
  onState,
  readOnly,
  tinker = false,
  toolbar = true,
  code = true,
  autoPlay = false,
  caption,
}: {
  lt: LessonToy;
  onState?: (state: unknown) => void;
  readOnly?: boolean;
  /** Knobs work in the inspector (the lab). */
  tinker?: boolean;
  toolbar?: boolean;
  code?: boolean;
  autoPlay?: boolean;
  caption?: ReactNode;
}) {
  const lang = useLang();
  const t = useT();
  const { hint, labels, setLabels } = useWb();
  const toy: AnyToy = lt.toy;
  const cap = useCapability();
  const pref = useSettings((s) => s.view);
  const setSettings = useSettings((s) => s.set);
  const views = availableViews(toy);
  const view = chooseView(views, cap, pref);
  const offered = views.filter((v) => v === '2d' || chooseView(views, cap, v) === v);
  // State, not a ref: the overlay's effects need the element on their first run.
  const [canvas, setCanvas] = useState<HTMLDivElement | null>(null);
  const play = useAutoplay(lt, autoPlay);

  useEffect(() => {
    onState?.(lt.state);
  }, [lt.state, onState]);

  const parts = !readOnly && toy.parts ? toy.parts(lt.state, lang) : [];
  const lines: EqLine[] = toy.explain
    ? toy.explain(lt.state, lang)
    : toy.toEquation
      ? [{ parts: toy.toEquation(lt.state, lang) }]
      : [];
  const Controls = toy.controls;
  // Stop playing as soon as the child takes over.
  const dispatch = (a: unknown) => {
    play.stop();
    lt.dispatch(a);
  };

  return (
    <div className="kg-wb-toy">
      {caption && <div className="kg-wb-caption">{caption}</div>}
      <div className="kg-canvas" data-view={view} data-dock={toolbar && !readOnly} ref={setCanvas}>
        <div className="kg-canvas__scene">
          <ToyHost
            toy={toy}
            state={lt.state}
            dispatch={dispatch}
            view={view}
            lang={lang}
            readOnly={readOnly}
            onFallback={() => setSettings({ view: '2d' })}
          />
        </div>
        {canvas && parts.length > 0 && (
          <StageOverlay
            root={canvas}
            parts={parts}
            dispatch={dispatch}
            tinker={tinker}
            dep={`${view}|${JSON.stringify(lt.state)}`}
          />
        )}
        {toolbar && !readOnly && (
          <div className="kg-dock" role="toolbar" aria-label={t(S.tools)}>
            <IconButton label={t(S.undo)} onClick={lt.undo} disabled={!lt.canUndo}>
              ⟲
            </IconButton>
            <IconButton label={t(S.redo)} onClick={lt.redo} disabled={!lt.canRedo}>
              ⟳
            </IconButton>
            <IconButton label={t(S.restart)} onClick={lt.restart}>
              ↺
            </IconButton>
            {offered.length > 1 && (
              <>
                <span className="kg-dock__sep" />
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
              </>
            )}
            {toy.parts && (
              <>
                <span className="kg-dock__sep" />
                <IconButton label={t(S.showLabels)} aria-pressed={labels} onClick={() => setLabels(!labels)}>
                  🏷️
                </IconButton>
              </>
            )}
            {hint && (
              <IconButton label={t(S.hint)} onClick={hint} className="kg-dock__hint">
                💡
              </IconButton>
            )}
          </div>
        )}
      </div>
      {Controls && <Controls state={lt.state} dispatch={dispatch} lang={lang} readOnly={readOnly} />}
      {code && lines.length > 0 && (
        <Slot name="code">
          <MathCode lines={lines} lang={lang} play={play} onRestart={readOnly ? undefined : lt.restart} />
        </Slot>
      )}
    </div>
  );
}
