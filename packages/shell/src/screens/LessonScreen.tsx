import { useProgress, type Mode } from '@khelaghor/core';
import { pick } from '@khelaghor/i18n';
import { Tabs, type TabItem } from '@khelaghor/ui';
import { voice } from '@khelaghor/voice';
import { useEffect } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router';
import { useBook } from '../book';
import { TopBar } from '../components/TopBar';
import { topicNo, useLang, useT } from '../hooks';
import { S } from '../strings';
import { ExploreMode } from './lesson/ExploreMode';
import { LearnMode } from './lesson/LearnMode';
import { PracticeMode } from './lesson/PracticeMode';
import { TryMode } from './lesson/TryMode';

const MODES: Mode[] = ['explore', 'try', 'practice', 'learn'];

/** The lesson playground: one topic, four modes (book symbols), the toy stage at the centre. */
export function LessonScreen() {
  const { topicId = '', mode = 'explore' } = useParams();
  const book = useBook();
  const lang = useLang();
  const t = useT();
  const nav = useNavigate();
  const found = book.topic(topicId);
  const p = useProgress((s) => s.books[book.data.id]?.[topicId]);
  const mark = useProgress((s) => s.mark);

  useEffect(() => {
    if (found) mark(book.data.id, topicId, {});
    return () => voice.stop();
  }, [book.data.id, topicId, found, mark]);

  useEffect(() => () => voice.stop(), [mode]);

  if (!found || !MODES.includes(mode as Mode)) return <Navigate to="/" replace />;
  const { topic, chapter } = found;
  const sym = book.data.modeSymbols;
  const tabs: TabItem[] = [
    { id: 'explore', symbol: sym.explore?.symbol, label: pick(sym.explore?.name, lang), done: p?.explored },
    { id: 'try', symbol: sym.try?.symbol, label: pick(sym.try?.name, lang), done: p?.tried },
    {
      id: 'practice',
      symbol: sym.practice?.symbol,
      label: pick(sym.practice?.name, lang),
      done: p?.mastered,
    },
    { id: 'learn', symbol: '📘', label: t(S.learn) },
  ];
  const go = (m: string) => nav(`/t/${topicId}/${m}`);
  return (
    <div className="kg-screen">
      <TopBar back={`/ch/${chapter.id}`} title={`${topicNo(topic.id, lang)} · ${pick(topic.title, lang)}`} />
      <div className="kg-lesson-tabs">
        <Tabs items={tabs} value={mode} onChange={go} label={pick(topic.title, lang)} />
      </div>
      <main className="kg-lesson" key={`${topicId}/${mode}`}>
        {mode === 'explore' && <ExploreMode topic={topic} onNext={() => go('try')} />}
        {mode === 'try' && <TryMode topic={topic} onNext={() => go('practice')} />}
        {mode === 'practice' && <PracticeMode topic={topic} />}
        {mode === 'learn' && <LearnMode topic={topic} onNext={() => go('practice')} />}
      </main>
    </div>
  );
}
