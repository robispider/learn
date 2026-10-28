import type { Topic } from '@khelaghor/core';
import { pick } from '@khelaghor/i18n';
import { Button, RuleCard } from '@khelaghor/ui';
import { useEffect } from 'react';
import { useBook } from '../../book';
import { DialogueLine } from '../../components/Dialogue';
import { useLang, useSay, useT } from '../../hooks';
import { S } from '../../strings';
import { Slot } from '../context';
import { PanelHead } from '../PanelBits';
import { ToyStage, useLessonToy } from '../ToyStage';

/** 📘 শিখি: the rule and the book's words, with the lesson's example playing itself on the stage. */
export function LearnMode({
  topic,
  onNext,
  nextLabel,
}: {
  topic: Topic;
  onNext: () => void;
  nextLabel: string;
}) {
  const book = useBook();
  const lang = useLang();
  const t = useT();
  const say = useSay();
  const lt = useLessonToy(topic.explore.toy, topic.explore.config);
  const words = topic.learn.vocab.map((id) => book.data.glossary.find((g) => g.id === id)).filter((g) => !!g);
  useEffect(() => {
    say(topic.learn.rule, book.data.companion);
    // Read the rule once when the card opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <>
      <Slot name="stage">
        <ToyStage lt={lt} readOnly autoPlay caption={t(S.watchExample)} />
      </Slot>
      <Slot name="panel">
        <PanelHead topic={topic} />
        <span className="kg-kicker">📘 {t(S.rule)}</span>
        <RuleCard>{pick(topic.learn.rule, lang)}</RuleCard>
        {topic.learn.example && (
          <DialogueLine
            speaker={book.data.companion}
            text={topic.learn.example}
            pose="point"
            autoSay={false}
            size={60}
          />
        )}
        {words.length > 0 && (
          <section>
            <span className="kg-kicker">{t(S.words)}</span>
            <ul className="kg-words">
              {words.map((w) => (
                <li key={w.id}>
                  <button type="button" className="kg-word" onClick={() => say(w.bn, book.data.companion)}>
                    🔊 <strong>{w.bn}</strong> <span className="kg-muted">({w.en})</span>
                  </button>
                  {w.definition && <p>{pick(w.definition, lang)}</p>}
                </li>
              ))}
            </ul>
          </section>
        )}
        <p className="kg-muted">📖 {t(S.openBook, { a: topic.bookPages[0], b: topic.bookPages[1] })}</p>
        <div className="kg-panel-actions">
          <Button variant="primary" size="lg" onClick={onNext}>
            {nextLabel}
          </Button>
        </div>
      </Slot>
    </>
  );
}
