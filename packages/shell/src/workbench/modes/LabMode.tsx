import { useProgress, type Challenge, type Topic } from '@khelaghor/core';
import { pick } from '@khelaghor/i18n';
import { Button, Confetti } from '@khelaghor/ui';
import { playSfx } from '@khelaghor/voice';
import { useCallback, useState } from 'react';
import { useBook } from '../../book';
import { DialogueLine } from '../../components/Dialogue';
import { useLang, useT } from '../../hooks';
import { PRAISE, S } from '../../strings';
import { Slot } from '../context';
import { KnobList } from '../Knobs';
import { PanelHead } from '../PanelBits';
import { StepCard } from '../StepCard';
import { ToyStage, useLessonToy } from '../ToyStage';

const LEVEL_STARS = ['', '★', '★★', '★★★'];

/**
 * 🎛️ বদলে দেখি: the toy with every knob unlocked. Free play, or a ladder of challenges that add
 * complexity step by step (often solved by changing the parts, not just by playing).
 */
export function LabMode({
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
  const progress = useProgress();
  const lab = topic.lab!;
  const solvedIds = progress.books[book.data.id]?.[topic.id]?.lab ?? [];
  const [pick_, setPick] = useState<number>(-1);
  const [solved, setSolved] = useState(false);
  const [burst, setBurst] = useState(0);
  const ch: Challenge | undefined = lab.challenges[pick_];
  const lt = useLessonToy(lab.toy, ch?.setup ?? lab.config, `c${pick_}`);

  const choose = (i: number) => {
    setPick(i);
    setSolved(false);
  };

  const succeed = useCallback(() => {
    if (!ch) return;
    setSolved(true);
    setBurst((b) => b + 1);
    playSfx('success');
    const before = progress.topic(book.data.id, topic.id).lab ?? [];
    if (!before.includes(ch.id)) progress.mark(book.data.id, topic.id, { lab: [...before, ch.id] });
  }, [book.data.id, ch, progress, topic.id]);

  const onState = useCallback(
    (state: unknown) => {
      if (ch && !solved && ch.expect !== undefined && lt.toy.check?.(state, ch.expect)) succeed();
    },
    [ch, solved, succeed, lt.toy],
  );

  const parts = lt.toy.parts?.(lt.state, lang) ?? [];
  const nextIndex = lab.challenges.findIndex((c, i) => i > pick_ && !solvedIds.includes(c.id));

  return (
    <>
      <Slot name="stage">
        <ToyStage lt={lt} onState={onState} tinker />
      </Slot>
      <Slot name="panel">
        <PanelHead topic={topic} />
        {ch ? (
          <section className="kg-challenge-run">
            <div className="kg-step-head">
              <span className="kg-badge" data-level={ch.level}>
                {LEVEL_STARS[ch.level]} {pick(ch.title, lang)}
              </span>
              <Button size="sm" variant="ghost" onClick={() => choose(-1)}>
                ← {t(S.allChallenges)}
              </Button>
            </div>
            <StepCard
              key={pick_}
              step={ch}
              solved={solved}
              onSolve={succeed}
              praise={PRAISE[pick_ % PRAISE.length]!}
              next={
                solved
                  ? nextIndex >= 0
                    ? { label: t(S.nextChallenge), onClick: () => choose(nextIndex) }
                    : { label: nextLabel, onClick: onNext }
                  : undefined
              }
            />
          </section>
        ) : (
          <DialogueLine speaker={book.data.companion} text={S.labIntro} pose="point" />
        )}
        <section className="kg-lab-parts">
          <span className="kg-kicker">🎛️ {t(S.changeParts)}</span>
          <KnobList parts={parts} dispatch={lt.dispatch} lang={lang} />
        </section>
        {lab.challenges.length > 0 && (
          <section className="kg-ladder">
            <span className="kg-kicker">
              🧗 {t(S.challenges)} · {t(S.solvedOf, { k: solvedIds.length, n: lab.challenges.length })}
            </span>
            <ol>
              {lab.challenges.map((c, i) => {
                const done = solvedIds.includes(c.id);
                return (
                  <li key={c.id}>
                    <button
                      type="button"
                      className="kg-ladder__item"
                      aria-current={i === pick_}
                      data-done={done}
                      onClick={() => choose(i)}
                    >
                      <span
                        className="kg-ladder__level"
                        data-level={c.level}
                        aria-label={t(S.level, { n: c.level })}
                      >
                        {LEVEL_STARS[c.level]}
                      </span>
                      <span className="kg-ladder__title">{pick(c.title, lang)}</span>
                      <span className="kg-ladder__done" aria-hidden>
                        {done ? '✓' : '›'}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>
            {!ch && (
              <div className="kg-panel-actions">
                <Button onClick={onNext}>{nextLabel}</Button>
              </div>
            )}
          </section>
        )}
      </Slot>
      <Confetti burst={burst} />
    </>
  );
}
