import { useProgress, type Mode } from '@khelaghor/core';
import { pick } from '@khelaghor/i18n';
import { voice } from '@khelaghor/voice';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router';
import { useBook } from '../book';
import { useLang, useT } from '../hooks';
import { S } from '../strings';
import { WbCtx, type SlotName } from './context';
import { ChapterDrawer, LessonStrip, Rail, WbHeader } from './Chrome';
import { ExploreMode } from './modes/ExploreMode';
import { LabMode } from './modes/LabMode';
import { LearnMode } from './modes/LearnMode';
import { PracticeMode } from './modes/PracticeMode';
import { TryMode } from './modes/TryMode';
import './workbench.css';

/**
 * The lesson workbench: rail · header · stage (the toy with callouts, a ▶ run pill, and the knobs and
 * tools along its left edge) · side panel (mode tabs, the mode's panel, or the ▶ চালাও tab with the live
 * math language) · the chapter's lesson strip. Each mode fills the stage and the panel through slots.
 */
export function Workbench() {
  const { topicId = '', mode = 'explore' } = useParams();
  const book = useBook();
  const lang = useLang();
  const t = useT();
  const nav = useNavigate();
  const found = book.topic(topicId);
  const p = useProgress((s) => s.books[book.data.id]?.[topicId]);
  const mark = useProgress((s) => s.mark);
  const [slots, setSlots] = useState<Partial<Record<SlotName, HTMLElement | null>>>({});
  const [hint, setHintFn] = useState<(() => void) | null>(null);
  // Name tags crowd a phone-sized stage: start with dots only there.
  const [labels, setLabels] = useState(() => window.innerWidth >= 700);
  const [rail, setRail] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [run, setRun] = useState(false);
  const [hasCode, setHasCode] = useState(false);

  const slotRef = useCallback(
    (name: SlotName) => (el: HTMLElement | null) =>
      setSlots((s) => (s[name] === el ? s : { ...s, [name]: el })),
    [],
  );
  const refs = useMemo(
    () => ({ stage: slotRef('stage'), panel: slotRef('panel'), code: slotRef('code') }),
    [slotRef],
  );
  const setHint = useCallback((fn: (() => void) | null) => setHintFn(() => fn), []);
  const goMode = useCallback((m: string) => nav(`/t/${topicId}/${m}`), [nav, topicId]);
  const canLab = !!found?.topic.lab;
  const wb = useMemo(
    () => ({ slots, hint, setHint, labels, setLabels, goMode, canLab, run, setRun, setHasCode }),
    [slots, hint, setHint, labels, goMode, canLab, run],
  );

  useEffect(() => {
    if (found) mark(book.data.id, topicId, {});
    setDrawer(false);
    return () => voice.stop();
  }, [book.data.id, topicId, found, mark]);
  useEffect(() => () => voice.stop(), [mode]);
  // Each mode opens on its own panel; the ▶ tab goes away when the stage has no math to show.
  useEffect(() => setRun(false), [topicId, mode]);
  useEffect(() => {
    if (!hasCode) setRun(false);
  }, [hasCode]);

  const order: Mode[] = canLab
    ? ['explore', 'try', 'lab', 'learn', 'practice']
    : ['explore', 'try', 'learn', 'practice'];
  if (!found || !order.includes(mode as Mode)) return <Navigate to="/" replace />;
  const { topic, chapter } = found;
  const sym = book.data.modeSymbols;
  const done: Partial<Record<Mode, boolean>> = {
    explore: p?.explored,
    try: p?.tried,
    lab: !!topic.lab?.challenges.length && topic.lab.challenges.every((c) => p?.lab?.includes(c.id)),
    practice: p?.mastered,
  };
  const name = (m: Mode) => pick(sym[m]?.name, lang) || t(S.learn);
  const nextOf = (m: Mode) => order[order.indexOf(m) + 1];
  const next = nextOf(mode as Mode);
  const nextProps = next
    ? {
        onNext: () => goMode(next),
        nextLabel: `${sym[next]?.symbol ?? ''} ${t(S.nextUp, { x: name(next) })}`,
      }
    : { onNext: () => nav('/'), nextLabel: t(S.home) };

  return (
    <WbCtx.Provider value={wb}>
      <div className="kg-wb" data-rail={rail ? 'open' : 'closed'}>
        <Rail
          open={rail}
          onToggle={() => setRail((r) => !r)}
          onChapters={() => setDrawer(true)}
          game={topic.game}
        />
        <WbHeader chapter={chapter} onChapters={() => setDrawer(true)} />
        <section className="kg-wb-stage" ref={refs.stage} aria-label={pick(topic.title, lang)} />
        <aside className="kg-wb-side">
          <div className="kg-wb-tabs" role="tablist" aria-label={pick(topic.title, lang)}>
            {order.map((m) => (
              <button
                key={m}
                type="button"
                role="tab"
                aria-selected={m === mode && !run}
                onClick={() => (m === mode ? setRun(false) : goMode(m))}
                data-done={done[m] || undefined}
              >
                <span className="kg-wb-tabs__sym" aria-hidden>
                  {sym[m]?.symbol}
                </span>
                {name(m)}
              </button>
            ))}
            {hasCode && (
              <button
                type="button"
                role="tab"
                aria-selected={run}
                className="kg-wb-tabs__run"
                onClick={() => setRun(true)}
              >
                <span className="kg-wb-tabs__sym" aria-hidden>
                  ▶
                </span>
                {t(S.playIt)}
              </button>
            )}
          </div>
          <div className="kg-wb-panel" ref={refs.panel} hidden={run} />
          <div className="kg-wb-panel kg-wb-code" ref={refs.code} hidden={!run} />
        </aside>
        <LessonStrip chapter={chapter} current={topic.id} onChapters={() => setDrawer(true)} />
        <ChapterDrawer open={drawer} onClose={() => setDrawer(false)} current={chapter} />
        <div key={`${topicId}/${mode}`} className="kg-wb-modes">
          {mode === 'explore' && <ExploreMode topic={topic} onNext={() => goMode('try')} />}
          {mode === 'try' && <TryMode topic={topic} {...nextProps} />}
          {mode === 'lab' && <LabMode topic={topic} {...nextProps} />}
          {mode === 'learn' && <LearnMode topic={topic} {...nextProps} />}
          {mode === 'practice' && <PracticeMode topic={topic} />}
        </div>
      </div>
    </WbCtx.Provider>
  );
}
