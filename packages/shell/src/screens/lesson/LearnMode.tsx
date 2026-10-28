import { CharacterSvg } from '@khelaghor/art';
import type { Topic } from '@khelaghor/core';
import { pick } from '@khelaghor/i18n';
import { Button, RuleCard } from '@khelaghor/ui';
import { useEffect } from 'react';
import { useBook } from '../../book';
import { useLang, useSay, useT } from '../../hooks';
import { S } from '../../strings';

/** 📘 Learn card: the rule, an example, the book's words, and the book pages. */
export function LearnMode({ topic, onNext }: { topic: Topic; onNext: () => void }) {
  const book = useBook();
  const lang = useLang();
  const t = useT();
  const say = useSay();
  const words = topic.learn.vocab.map((id) => book.data.glossary.find((g) => g.id === id)).filter((g) => !!g);
  useEffect(() => {
    say(topic.learn.rule, book.data.companion);
    // Read the rule once when the card opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div className="kg-learn">
      <div className="kg-learn__rule">
        <CharacterSvg id={book.data.companion} pose="point" size={150} />
        <div style={{ display: 'grid', gap: 12, flex: 1 }}>
          <h2 className="kg-h2">📘 {t(S.rule)}</h2>
          <RuleCard>{pick(topic.learn.rule, lang)}</RuleCard>
          {topic.learn.example && (
            <div className="kg-card">
              <strong>{t(S.example)}: </strong>
              {pick(topic.learn.example, lang)}
            </div>
          )}
        </div>
      </div>
      {words.length > 0 && (
        <>
          <h2 className="kg-h2">{t(S.words)}</h2>
          <ul className="kg-words">
            {words.map((w) => (
              <li key={w.id} className="kg-card">
                <button type="button" className="kg-word" onClick={() => say(w.bn, book.data.companion)}>
                  🔊 <strong>{w.bn}</strong> <span className="kg-muted">({w.en})</span>
                </button>
                {w.definition && <p>{pick(w.definition, lang)}</p>}
              </li>
            ))}
          </ul>
        </>
      )}
      <p className="kg-muted">📖 {t(S.openBook, { a: topic.bookPages[0], b: topic.bookPages[1] })}</p>
      <div className="kg-panel-actions">
        <Button variant="primary" size="lg" onClick={onNext}>
          {book.data.modeSymbols.practice?.symbol} {t(S.goPractice)}
        </Button>
      </div>
    </div>
  );
}
