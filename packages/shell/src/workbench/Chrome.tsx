import { topicStars, useProgress, useSettings, type Chapter, type Topic } from '@khelaghor/core';
import { formatNumber, pick } from '@khelaghor/i18n';
import { Stars } from '@khelaghor/ui';
import { voice } from '@khelaghor/voice';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useRef, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router';
import { useBook } from '../book';
import { topicNo, useLang, useT } from '../hooks';
import { S } from '../strings';

function RailItem({
  icon,
  label,
  onClick,
  pressed,
}: {
  icon: ReactNode;
  label: string;
  onClick: () => void;
  pressed?: boolean;
}) {
  return (
    <button type="button" className="kg-rail__item" onClick={onClick} aria-pressed={pressed} title={label}>
      <span className="kg-rail__icon" aria-hidden>
        {icon}
      </span>
      <span className="kg-rail__label">{label}</span>
    </button>
  );
}

/** Left icon rail (bottom bar on phones): map, chapters, game, settings, voice, language. */
export function Rail({
  open,
  onToggle,
  onChapters,
  game,
}: {
  open: boolean;
  onToggle: () => void;
  onChapters: () => void;
  game?: string;
}) {
  const nav = useNavigate();
  const t = useT();
  const settings = useSettings();
  const lang = settings.lang;
  return (
    <nav className="kg-rail" data-open={open} aria-label={t(S.menu)}>
      <button
        type="button"
        className="kg-rail__toggle"
        onClick={onToggle}
        aria-expanded={open}
        aria-label={t(S.menu)}
      >
        {open ? '‹' : '›'}
      </button>
      <RailItem icon="🗺️" label={t(S.home)} onClick={() => nav('/')} />
      <RailItem icon="📚" label={t(S.chapters)} onClick={onChapters} />
      {game && <RailItem icon="🎮" label={t(S.games)} onClick={() => nav(`/game/${game}`)} />}
      <RailItem icon="⚙️" label={t(S.settings)} onClick={() => nav('/settings')} />
      <span className="kg-rail__spacer" />
      <RailItem
        icon={settings.voice ? '🔊' : '🔇'}
        label={t(settings.voice ? S.voiceOn : S.voiceOff)}
        pressed={settings.voice}
        onClick={() => {
          if (settings.voice) voice.stop();
          settings.set({ voice: !settings.voice });
        }}
      />
      <RailItem
        icon={<span className="kg-rail__lang">{lang === 'bn' ? 'EN' : 'বা'}</span>}
        label={lang === 'bn' ? 'English' : 'বাংলা'}
        onClick={() => settings.set({ lang: lang === 'bn' ? 'en' : 'bn' })}
      />
    </nav>
  );
}

function chapterStars(
  chapter: Chapter,
  progress: ReturnType<typeof useProgress.getState>['books'][string] | undefined,
) {
  const got = chapter.topics.reduce((n, tp) => n + topicStars(progress?.[tp.id]), 0);
  return { got, of: chapter.topics.length * 3 };
}

/** Header: the app name, and the chapter's progress card that opens the chapter switcher. */
export function WbHeader({ chapter, onChapters }: { chapter: Chapter; onChapters: () => void }) {
  const book = useBook();
  const lang = useLang();
  const t = useT();
  const progress = useProgress((s) => s.books[book.data.id]);
  const { got, of } = chapterStars(chapter, progress);
  const total = book.topics.reduce((n, { topic }) => n + topicStars(progress?.[topic.id]), 0);
  return (
    <header className="kg-wb-head">
      <Link to="/" className="kg-brand">
        <span className="kg-brand__logo" aria-hidden>
          🏡
        </span>
        <span className="kg-brand__text">
          <strong>{pick(book.data.title, lang)}</strong>
          <small>{t(S.tagline)}</small>
        </span>
      </Link>
      <button type="button" className="kg-chapter-card" onClick={onChapters} aria-label={t(S.chapters)}>
        <span className="kg-chapter-card__art" aria-hidden>
          {chapter.place.art}
        </span>
        <span className="kg-chapter-card__body">
          <small>{t(S.chapter, { n: chapter.no })}</small>
          <strong>{pick(chapter.title, lang)}</strong>
          <span className="kg-bar" aria-hidden>
            <span style={{ width: `${of ? (100 * got) / of : 0}%` }} />
          </span>
        </span>
        <span className="kg-chapter-card__count">
          ★ {formatNumber(got, lang)}/{formatNumber(of, lang)}
        </span>
      </button>
      <span className="kg-wb-head__stars" title="★">
        <span className="kg-stars__on">★</span> {formatNumber(total, lang)}
      </span>
    </header>
  );
}

type Row = { id: string; title: Topic['title']; bookPages: [number, number]; topic?: Topic };

export function chapterRows(chapter: Chapter): Row[] {
  return [
    ...chapter.topics.map((tp) => ({ id: tp.id, title: tp.title, bookPages: tp.bookPages, topic: tp })),
    ...chapter.upcoming.map((u) => ({
      id: u.id,
      title: u.title,
      bookPages: u.bookPages as [number, number],
    })),
  ].sort((a, b) => a.bookPages[0] - b.bookPages[0] || a.id.localeCompare(b.id, 'en', { numeric: true }));
}

function Thumb({ topic }: { topic: Topic }) {
  const book = useBook();
  const toy = book.toy(topic.explore.toy);
  const T = toy.thumbnail;
  if (!T) return <span aria-hidden>{book.topic(topic.id)?.chapter.place.art}</span>;
  return <T config={toy.configSchema.parse(topic.explore.config)} />;
}

/** Bottom strip of lesson cards for this chapter (upcoming ones locked), like a playlist. */
export function LessonStrip({
  chapter,
  current,
  onChapters,
}: {
  chapter: Chapter;
  current: string;
  onChapters: () => void;
}) {
  const book = useBook();
  const lang = useLang();
  const t = useT();
  const progress = useProgress((s) => s.books[book.data.id]);
  const row = useRef<HTMLOListElement>(null);
  useEffect(() => {
    row.current
      ?.querySelector('[aria-current="page"]')
      ?.scrollIntoView({ block: 'nearest', inline: 'center' });
  }, [current]);
  const scroll = (d: number) => row.current?.scrollBy({ left: d * 280, behavior: 'smooth' });
  return (
    <nav className="kg-strip" aria-label={t(S.topics)}>
      <div className="kg-strip__head">
        <span className="kg-kicker">{t(S.topics)}</span>
        <button type="button" className="kg-strip__chapter" onClick={onChapters}>
          📚 {t(S.chapter, { n: chapter.no })} · {pick(chapter.title, lang)} ▾
        </button>
      </div>
      <div className="kg-strip__row">
        <button type="button" className="kg-strip__arrow" onClick={() => scroll(-1)} aria-label={t(S.back)}>
          ‹
        </button>
        <ol ref={row}>
          {chapterRows(chapter).map((r) => (
            <li key={r.id}>
              {r.topic ? (
                <Link
                  to={`/t/${r.id}/explore`}
                  className="kg-lcard"
                  aria-current={r.id === current ? 'page' : undefined}
                >
                  <span className="kg-lcard__thumb">
                    <Thumb topic={r.topic} />
                  </span>
                  <span className="kg-lcard__text">
                    <span>
                      <b>{topicNo(r.id, lang)}</b> {pick(r.title, lang)}
                    </span>
                    <Stars n={topicStars(progress?.[r.id])} size={12} />
                  </span>
                  <span className="kg-lcard__go" aria-hidden>
                    ›
                  </span>
                </Link>
              ) : (
                <div className="kg-lcard" data-locked="true" title={t(S.comingSoon)}>
                  <span className="kg-lcard__thumb" aria-hidden>
                    🔒
                  </span>
                  <span className="kg-lcard__text">
                    <span>
                      <b>{topicNo(r.id, lang)}</b> {pick(r.title, lang)}
                    </span>
                    <small>{t(S.comingSoon)}</small>
                  </span>
                </div>
              )}
            </li>
          ))}
        </ol>
        <button type="button" className="kg-strip__arrow" onClick={() => scroll(1)} aria-label={t(S.next)}>
          ›
        </button>
      </div>
    </nav>
  );
}

/** Slide-in list of every chapter and its lessons: switch chapter or lesson from anywhere. */
export function ChapterDrawer({
  open,
  onClose,
  current,
}: {
  open: boolean;
  onClose: () => void;
  current: Chapter;
}) {
  const book = useBook();
  const lang = useLang();
  const t = useT();
  const progress = useProgress((s) => s.books[book.data.id]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="kg-drawer-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.aside
            className="kg-drawer"
            role="dialog"
            aria-modal="true"
            aria-label={t(S.chapters)}
            initial={{ x: -40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -40, opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={(e) => e.stopPropagation()}
          >
            <header>
              <strong>📚 {t(S.chapters)}</strong>
              <button type="button" className="kg-icon-btn" onClick={onClose} aria-label={t(S.close)}>
                ×
              </button>
            </header>
            <Link to="/" className="kg-drawer__map" onClick={onClose}>
              🗺️ {t(S.mapTitle)}
            </Link>
            <ol>
              {book.data.chapters.map((c) => {
                const { got, of } = chapterStars(c, progress);
                return (
                  <li key={c.id}>
                    <details open={c.id === current.id}>
                      <summary data-ready={c.topics.length > 0}>
                        <span aria-hidden>{c.place.art}</span>
                        <span className="kg-drawer__ch">
                          <b>{formatNumber(c.no, lang)}</b> {pick(c.title, lang)}
                        </span>
                        <small>
                          {c.topics.length
                            ? `★ ${formatNumber(got, lang)}/${formatNumber(of, lang)}`
                            : t(S.comingSoon)}
                        </small>
                      </summary>
                      <ul>
                        {chapterRows(c).map((r) => (
                          <li key={r.id}>
                            {r.topic ? (
                              <Link to={`/t/${r.id}/explore`} onClick={onClose}>
                                <b>{topicNo(r.id, lang)}</b> {pick(r.title, lang)}
                                <Stars n={topicStars(progress?.[r.id])} size={11} />
                              </Link>
                            ) : (
                              <span data-locked="true">
                                <b>{topicNo(r.id, lang)}</b> {pick(r.title, lang)} 🔒
                              </span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </details>
                  </li>
                );
              })}
            </ol>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
