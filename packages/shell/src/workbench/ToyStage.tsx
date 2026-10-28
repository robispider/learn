import { useSettings } from '@khelaghor/core';
import { formatNumber, type Lang } from '@khelaghor/i18n';
import {
  availableViews,
  lessonView,
  ToyHost,
  useCapability,
  useToy,
  type AnyToy,
  type EqLine,
  type ViewMode,
} from '@khelaghor/stage';
import { Button, EquationChips, IconButton } from '@khelaghor/ui';
import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { useBook } from '../book';
import { useLang, useT } from '../hooks';
import { S } from '../strings';
import { Slot, useWb } from './context';
import { RailKnobs } from './Knobs';
import { StageOverlay } from './StageOverlay';

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
  /** One move of the idea at a time (from the start again once it is finished). */
  const step = () => {
    setPlaying(false);
    const a = toy.autoplay?.(state);
    if (a === null || a === undefined) lt.restart();
    else dispatch(a);
  };
  return { playing, canPlay, start, step, stop: () => setPlaying(false) };
}
type Play = ReturnType<typeof useAutoplay>;

/**
 * The stage's corner of the "math language": its caption, the live number sentence and ▶, which plays
 * the idea and opens the ▶ চালাও tab with every line.
 */
function RunPill({ line, lang, play, caption }: { line?: EqLine; lang: Lang; play: Play; caption?: ReactNode }) {
  const t = useT();
  const { setRun } = useWb();
  // The scene starts below the pill, however tall it wraps.
  const ref = useRef<HTMLElement>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    const host = el?.parentElement;
    if (!el || !host) return;
    const ro = new ResizeObserver(() => host.style.setProperty('--slate-h', `${el.offsetHeight}px`));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return (
    <section className="kg-slate" aria-label={t(S.mathCode)} ref={ref}>
      <span className="kg-slate__title">{caption ?? `✏️ ${t(S.mathCode)}`}</span>
      {line && line.parts.length > 0 && <EquationChips parts={line.parts} lang={lang} />}
      <button
        type="button"
        className="kg-slate__run"
        aria-pressed={play.playing}
        onClick={() => {
          setRun(true);
          if (!play.canPlay) return;
          if (play.playing) play.stop();
          else play.start();
        }}
      >
        {play.playing ? `⏸ ${t(S.pause)}` : `▶ ${t(S.playIt)}`}
      </button>
    </section>
  );
}

/** The ▶ চালাও tab: every line of the math language, numbered, with play · one step · restart. */
function CodePanel({
  lines,
  lang,
  play,
  caption,
  onRestart,
}: {
  lines: EqLine[];
  lang: Lang;
  play: Play;
  caption?: ReactNode;
  onRestart: () => void;
}) {
  const t = useT();
  return (
    <>
      <header className="kg-panel-head">
        <span className="kg-kicker">✏️ {t(S.mathCode)}</span>
        {caption && <h2>{caption}</h2>}
      </header>
      <ol className="kg-code" aria-live="polite">
        {lines.map((l, i) => (
          <li key={i} data-current={i === lines.length - 1 || undefined}>
            <span className="kg-code__no" aria-hidden>
              {formatNumber(i + 1, lang)}
            </span>
            {l.parts.length > 0 && <EquationChips parts={l.parts} lang={lang} />}
            {l.note && <span className="kg-code__note">{l.note}</span>}
          </li>
        ))}
      </ol>
      {play.canPlay && (
        <div className="kg-panel-actions kg-code__actions">
          <Button variant="primary" size="lg" onClick={play.playing ? play.stop : play.start}>
            {play.playing ? `⏸ ${t(S.pause)}` : `▶ ${t(S.playIt)}`}
          </Button>
          <Button onClick={play.step}>⏭ {t(S.oneStep)}</Button>
          <IconButton label={t(S.restart)} onClick={onRestart}>
            ↺
          </IconButton>
        </div>
      )}
    </>
  );
}

/**
 * The lesson stage. Everything about the simulation lives here, so the side panel only tells the lesson:
 * the toy (in the one view this scene asks for) with callouts, the ▶ run pill (top), the rail on the left
 * edge (the toy's knobs, then undo · redo · restart · labels · hint) and the toy's own status and action
 * buttons (bottom). The full math language goes to the side panel's ▶ চালাও tab.
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
  view: wanted,
}: {
  lt: LessonToy;
  /** The scene's view from the lesson content (default 2-D). */
  view?: ViewMode;
  onState?: (state: unknown) => void;
  readOnly?: boolean;
  /** Knobs work (the lab); elsewhere the rail shows them locked. */
  tinker?: boolean;
  toolbar?: boolean;
  code?: boolean;
  autoPlay?: boolean;
  caption?: ReactNode;
}) {
  const lang = useLang();
  const t = useT();
  const { hint, labels, setLabels, canLab, goMode, setHasCode } = useWb();
  const toy: AnyToy = lt.toy;
  const cap = useCapability();
  const pref = useSettings((s) => s.view);
  const setSettings = useSettings((s) => s.set);
  const view = lessonView(availableViews(toy), cap, wanted, pref);
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
  const dock = toolbar && !readOnly;
  const knobs = dock && parts.some((p) => p.knobs?.length);
  const slate = code && lines.length > 0;
  useEffect(() => {
    if (!slate) return;
    setHasCode(true);
    return () => setHasCode(false);
  }, [slate, setHasCode]);
  // Stop playing as soon as the child takes over.
  const dispatch = (a: unknown) => {
    play.stop();
    lt.dispatch(a);
  };

  return (
    <div className="kg-wb-toy" data-dock={dock ? (knobs ? 'knobs' : 'tools') : 'none'} data-slate={slate}>
      <div className="kg-canvas" data-view={view} ref={setCanvas}>
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
        {caption && !slate && <div className="kg-stage-caption">{caption}</div>}
      </div>
      {dock && (
        <aside className="kg-dock" aria-label={t(S.tools)}>
          {knobs && (
            <>
              <RailKnobs parts={parts} dispatch={dispatch} lang={lang} locked={!tinker || play.playing} />
              {play.playing ? (
                <p className="kg-dock__note">{t(S.lockedWhilePlaying)}</p>
              ) : (
                !tinker &&
                canLab && (
                  <Button size="sm" onClick={() => goMode('lab')}>
                    🎛️ {t(S.goLab)}
                  </Button>
                )
              )}
            </>
          )}
          <div className="kg-dock__tools" role="toolbar" aria-label={t(S.tools)}>
            <IconButton label={t(S.undo)} onClick={lt.undo} disabled={!lt.canUndo}>
              ⟲
            </IconButton>
            <IconButton label={t(S.redo)} onClick={lt.redo} disabled={!lt.canRedo}>
              ⟳
            </IconButton>
            <IconButton label={t(S.restart)} onClick={lt.restart}>
              ↺
            </IconButton>
            {toy.parts && (
              <IconButton label={t(S.showLabels)} aria-pressed={labels} onClick={() => setLabels(!labels)}>
                🏷️
              </IconButton>
            )}
            {hint && (
              <IconButton label={t(S.hint)} onClick={hint} className="kg-dock__hint">
                💡
              </IconButton>
            )}
          </div>
        </aside>
      )}
      {slate && <RunPill line={lines[0]} lang={lang} play={play} caption={caption} />}
      {slate && (
        <Slot name="code">
          <CodePanel lines={lines} lang={lang} play={play} caption={caption} onRestart={lt.restart} />
        </Slot>
      )}
      {Controls && (
        <div className="kg-actionbar">
          <Controls state={lt.state} dispatch={dispatch} lang={lang} readOnly={readOnly} />
        </div>
      )}
    </div>
  );
}
