import { Sticker } from '@khelaghor/art';
import { topicStars, useProgress } from '@khelaghor/core';
import { formatNumber, pick } from '@khelaghor/i18n';
import { Stars } from '@khelaghor/ui';
import { Link, Navigate, useParams } from 'react-router';
import { useBook } from '../book';
import { TopBar } from '../components/TopBar';
import { topicNo, useLang, useT } from '../hooks';
import { S } from '../strings';

export function ChapterScreen() {
  const { chapterId } = useParams();
  const book = useBook();
  const lang = useLang();
  const t = useT();
  const progress = useProgress((s) => s.books[book.data.id]);
  const chapter = book.data.chapters.find((c) => c.id === chapterId);
  if (!chapter) return <Navigate to="/" replace />;
  const modes = book.data.modeSymbols;
  const all = [
    ...chapter.topics.map((tp) => ({
      id: tp.id,
      ready: true as const,
      topic: tp,
      bookPages: tp.bookPages,
      title: tp.title,
    })),
    ...chapter.upcoming.map((u) => ({
      id: u.id,
      ready: false as const,
      topic: undefined,
      bookPages: u.bookPages,
      title: u.title,
    })),
  ].sort((a, b) => a.bookPages[0] - b.bookPages[0] || a.id.localeCompare(b.id, 'en', { numeric: true }));
  const games = [...new Set(chapter.topics.map((tp) => tp.game))].filter(
    (g): g is string => !!g && !!book.games[g],
  );
  return (
    <div className="kg-screen">
      <TopBar back="/" title={`${t(S.chapter, { n: chapter.no })} · ${pick(chapter.title, lang)}`} />
      <main className="kg-page">
        <header className="kg-chapter-head kg-card">
          <span className="kg-chapter-head__art" aria-hidden>
            {chapter.place.art}
          </span>
          <div>
            <h1 className="kg-h1">
              {formatNumber(chapter.no, lang)} · {pick(chapter.title, lang)}
            </h1>
            <p className="kg-muted">
              {pick(chapter.place.name, lang)} ·{' '}
              {t(S.bookPages, { a: chapter.bookPages[0], b: chapter.bookPages[1] })}
            </p>
          </div>
        </header>
        <h2 className="kg-h2">{t(S.topics)}</h2>
        <ol className="kg-topic-list">
          {all.map((row) => {
            const p = row.topic ? progress?.[row.topic.id] : undefined;
            return (
              <li key={row.id} className="kg-card kg-topic" data-ready={row.ready}>
                <div className="kg-topic__no">{topicNo(row.id, lang)}</div>
                <div className="kg-topic__body">
                  <strong className="kg-topic__title">{pick(row.title, lang)}</strong>
                  {row.topic && <span>{pick(row.topic.question, lang)}</span>}
                  <small className="kg-muted">
                    {t(S.bookPages, { a: row.bookPages[0], b: row.bookPages[1] })}
                  </small>
                  {row.ready ? (
                    <div className="kg-topic__modes">
                      <Link className="kg-btn kg-btn--sm" to={`/t/${row.id}/explore`}>
                        {modes.explore?.symbol} {pick(modes.explore?.name, lang)}
                      </Link>
                      <Link className="kg-btn kg-btn--sm" to={`/t/${row.id}/try`}>
                        {modes.try?.symbol} {pick(modes.try?.name, lang)}
                      </Link>
                      <Link className="kg-btn kg-btn--sm" to={`/t/${row.id}/practice`}>
                        {modes.practice?.symbol} {pick(modes.practice?.name, lang)}
                      </Link>
                      <Link className="kg-btn kg-btn--sm" to={`/t/${row.id}/learn`}>
                        📘 {t(S.learn)}
                      </Link>
                    </div>
                  ) : (
                    <span className="kg-badge">{t(S.comingSoon)}</span>
                  )}
                </div>
                {row.topic && (
                  <div className="kg-topic__side">
                    <Stars n={topicStars(p)} />
                    <Sticker id={row.topic.sticker} size={52} locked={!p?.sticker} />
                  </div>
                )}
              </li>
            );
          })}
        </ol>
        {games.length > 0 && (
          <>
            <h2 className="kg-h2">🎮 {t(S.games)}</h2>
            <div className="kg-row" style={{ flexWrap: 'wrap' }}>
              {games.map((g) => (
                <Link key={g} to={`/game/${g}`} className="kg-btn kg-btn--primary">
                  ▶ {pick(book.games[g]!.title, lang)}
                </Link>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
