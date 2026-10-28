import { CharacterSvg, Sticker } from '@khelaghor/art';
import { topicStars, useProgress } from '@khelaghor/core';
import { formatNumber, parseNumber, pick } from '@khelaghor/i18n';
import { Button, Stars } from '@khelaghor/ui';
import { motion } from 'motion/react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useBook } from '../book';
import { DialogueLine } from '../components/Dialogue';
import { TopBar } from '../components/TopBar';
import { topicNo, useLang, useT } from '../hooks';
import { S } from '../strings';

const W = 420;
const STEP = 124;

/** Story map: one place per chapter along a winding village path. Every chapter can be opened. */
function VillageMap() {
  const book = useBook();
  const lang = useLang();
  const t = useT();
  const nav = useNavigate();
  const progress = useProgress((s) => s.books[book.data.id]);
  const chapters = book.data.chapters;
  const H = 120 + chapters.length * STEP;
  const pts = chapters.map((_, i) => ({ x: i % 2 ? 300 : 120, y: 90 + i * STEP }));
  const path = pts.reduce((d, p, i) => {
    if (i === 0) return `M${p.x},${p.y}`;
    const prev = pts[i - 1]!;
    return `${d} C${prev.x},${prev.y + STEP * 0.6} ${p.x},${p.y - STEP * 0.6} ${p.x},${p.y}`;
  }, '');
  const riverY = 90 + 2.5 * STEP;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="kg-map" role="list" aria-label={t(S.mapTitle)}>
      <rect x={0} y={0} width={W} height={H} rx={28} fill="#CFEBB0" />
      {/* river with a little bridge, near the ghat chapters */}
      <path
        d={`M0,${riverY - 40} C120,${riverY + 30} 300,${riverY - 70} ${W},${riverY}`}
        stroke="#7CC6EE"
        strokeWidth={46}
        fill="none"
      />
      <path
        d={`M0,${riverY - 40} C120,${riverY + 30} 300,${riverY - 70} ${W},${riverY}`}
        stroke="#A9DDF7"
        strokeWidth={10}
        strokeDasharray="18 22"
        fill="none"
      />
      {Array.from({ length: Math.floor(H / 160) }, (_, i) => (
        <g key={i} transform={`translate(${i % 2 ? 30 : 390}, ${150 + i * 160})`} aria-hidden>
          <rect x={-4} y={0} width={8} height={22} fill="#8A5A34" />
          <circle cx={0} cy={-6} r={20} fill="#5DB85A" stroke="#2B2B40" strokeWidth={2} />
        </g>
      ))}
      <path d={path} stroke="#F3E2BF" strokeWidth={30} fill="none" strokeLinecap="round" />
      <path
        d={path}
        stroke="#E2C48E"
        strokeWidth={4}
        strokeDasharray="2 12"
        fill="none"
        strokeLinecap="round"
      />
      {chapters.map((c, i) => {
        const p = pts[i]!;
        const ready = c.topics.length > 0;
        const stars = c.topics.reduce((n, tp) => n + topicStars(progress?.[tp.id]), 0);
        return (
          <g key={c.id} role="listitem">
            <motion.g
              transform={`translate(${p.x}, ${p.y})`}
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.94 }}
              style={{ cursor: 'pointer' }}
              onClick={() => nav(`/ch/${c.id}`)}
              role="link"
              aria-label={`${t(S.chapter, { n: c.no })}: ${pick(c.title, lang)}`}
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && nav(`/ch/${c.id}`)}
            >
              {ready && <circle r={54} fill="#FFE14D" opacity={0.5} />}
              <circle r={44} fill={ready ? '#FFFFFF' : '#EFE7D8'} stroke="#2B2B40" strokeWidth={3} />
              <text
                y={4}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={34}
                opacity={ready ? 1 : 0.55}
              >
                {c.place.art}
              </text>
              <g transform="translate(-34,-38)">
                <circle r={16} fill={ready ? '#FF7A45' : '#B9B0A0'} stroke="#2B2B40" strokeWidth={2} />
                <text
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={17}
                  fontWeight={700}
                  fill="#fff"
                  fontFamily="var(--font)"
                >
                  {formatNumber(c.no, lang)}
                </text>
              </g>
              <foreignObject x={-90} y={48} width={180} height={64}>
                <div className="kg-map__label" data-ready={ready}>
                  <span>{pick(c.place.name, lang)}</span>
                  {ready ? (
                    <Stars n={stars} of={c.topics.length * 3} size={12} />
                  ) : (
                    <small>{t(S.comingSoon)}</small>
                  )}
                </div>
              </foreignObject>
            </motion.g>
          </g>
        );
      })}
    </svg>
  );
}

function PageSearch() {
  const book = useBook();
  const t = useT();
  const nav = useNavigate();
  const [value, setValue] = useState('');
  const [msg, setMsg] = useState('');
  const go = () => {
    const n = parseNumber(value);
    if (Number.isNaN(n)) return;
    const { chapter, topic } = book.findPage(n);
    if (topic) nav(`/t/${topic.id}/explore`);
    else if (chapter) {
      setMsg(`${t(S.pageMissing, { n })} ${t(S.pageChapter, { n, c: chapter.no })}`);
      nav(`/ch/${chapter.id}`);
    } else setMsg(t(S.pageMissing, { n }));
  };
  return (
    <form
      className="kg-card kg-page-search"
      onSubmit={(e) => {
        e.preventDefault();
        go();
      }}
    >
      <label htmlFor="kg-page">📖 {t(S.pageSearch)}</label>
      <div className="kg-row">
        <input
          id="kg-page"
          inputMode="numeric"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="৭৩"
        />
        <Button type="submit" variant="primary">
          {t(S.pageGo)}
        </Button>
      </div>
      {msg && <p className="kg-muted">{msg}</p>}
    </form>
  );
}

export function MapScreen() {
  const book = useBook();
  const lang = useLang();
  const t = useT();
  const progress = useProgress((s) => s.books[book.data.id]);
  const recent = [...book.topics].sort(
    (a, b) => (progress?.[b.topic.id]?.lastVisit ?? 0) - (progress?.[a.topic.id]?.lastVisit ?? 0),
  )[0];
  const stickers = book.topics.filter(({ topic }) => progress?.[topic.id]?.sticker);
  const games = Object.values(book.games);
  return (
    <div className="kg-screen">
      <TopBar />
      <main className="kg-map-layout">
        <section className="kg-map-side">
          <DialogueLine speaker={book.data.companion} text={S.greet} autoSay={false} size={84} />
          {recent && (
            <Link to={`/t/${recent.topic.id}/explore`} className="kg-card kg-today">
              <span className="kg-today__tag">⭐ {t(S.todayLesson)}</span>
              <strong>
                {formatNumber(recent.chapter.no, lang)} {pick(recent.chapter.title, lang)} ›{' '}
                {topicNo(recent.topic.id, lang)} {pick(recent.topic.title, lang)}
              </strong>
              <span className="kg-muted">{pick(recent.topic.question, lang)}</span>
              <span className="kg-btn kg-btn--primary">▶ {t(S.continue)}</span>
            </Link>
          )}
          <PageSearch />
          {games.length > 0 && (
            <div className="kg-card">
              <h2 className="kg-h2">🎮 {t(S.games)}</h2>
              {games.map((g) => (
                <Link key={g.id} to={`/game/${g.id}`} className="kg-game-link">
                  <CharacterSvg id="kid2" pose="cheer" size={56} />
                  <span>
                    <strong>{pick(g.title, lang)}</strong>
                    <br />
                    <small className="kg-muted">{pick(g.howTo, lang)}</small>
                  </span>
                </Link>
              ))}
            </div>
          )}
          <div className="kg-card">
            <h2 className="kg-h2">🏅 {t(S.stickers)}</h2>
            <div className="kg-sticker-row">
              {book.topics.map(({ topic }) => (
                <Sticker
                  key={topic.id}
                  id={topic.sticker}
                  size={64}
                  locked={!stickers.some((s) => s.topic.id === topic.id)}
                />
              ))}
            </div>
          </div>
        </section>
        <section className="kg-map-wrap">
          <h1 className="kg-h1">{t(S.mapTitle)}</h1>
          <VillageMap />
        </section>
      </main>
    </div>
  );
}
