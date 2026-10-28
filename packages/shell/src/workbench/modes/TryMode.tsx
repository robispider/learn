import { useProgress, type Step, type Topic } from '@khelaghor/core';
import { pick } from '@khelaghor/i18n';
import { Button, Confetti, ProgressDots } from '@khelaghor/ui';
import { playSfx } from '@khelaghor/voice';
import { useCallback, useMemo, useState } from 'react';
import { useBook } from '../../book';
import { DialogueLine } from '../../components/Dialogue';
import { useLang, useT } from '../../hooks';
import { PRAISE, S } from '../../strings';
import { Slot } from '../context';
import { PanelHead } from '../PanelBits';
import { StepCard } from '../StepCard';
import { ToyStage, useLessonToy } from '../ToyStage';

type Flat = { block: number; step: Step; index: number };

/** ▲ কাজ: guided steps. A step is done when the toy reaches `expect`, the boxes are right, or the right choice is picked. */
export function TryMode({
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
  const mark = useProgress((s) => s.mark);
  const steps: Flat[] = useMemo(
    () => topic.try.flatMap((b, block) => b.steps.map((step, index) => ({ block, step, index }))),
    [topic],
  );
  const [at, setAt] = useState(0);
  const [solved, setSolved] = useState(false);
  const [finished, setFinished] = useState(false);
  const [burst, setBurst] = useState(0);

  const cur = steps[at]!;
  const block = topic.try[cur.block]!;
  // The toy uses the latest `setup` at or before this step in its block.
  const config = useMemo(() => {
    let c = block.config;
    for (const s of block.steps.slice(0, cur.index + 1)) if (s.setup !== undefined) c = s.setup;
    return c;
  }, [block, cur.index]);
  const lt = useLessonToy(block.toy, config, `b${cur.block}`);

  const succeed = useCallback(() => {
    setSolved(true);
    setBurst((b) => b + 1);
    playSfx('success');
  }, []);

  const onState = useCallback(
    (state: unknown) => {
      if (!solved && cur.step.expect !== undefined && lt.toy.check?.(state, cur.step.expect)) succeed();
    },
    [cur.step.expect, solved, succeed, lt.toy],
  );

  const advance = () => {
    if (at + 1 >= steps.length) {
      setFinished(true);
      setBurst((b) => b + 1);
      playSfx('cheer');
      mark(book.data.id, topic.id, { tried: true });
      return;
    }
    setAt(at + 1);
    setSolved(false);
  };

  return (
    <>
      <Slot name="stage">
        <ToyStage
          lt={lt}
          onState={onState}
          view={block.view}
          caption={block.title ? pick(block.title, lang) : undefined}
        />
      </Slot>
      <Slot name="panel">
        <PanelHead topic={topic} />
        {finished ? (
          <>
            <DialogueLine speaker={book.data.companion} text={S.tryDone} pose="cheer" expression="proud" />
            <div className="kg-panel-actions">
              <Button variant="primary" size="lg" onClick={onNext}>
                {nextLabel}
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="kg-step-head">
              <span className="kg-badge">{t(S.stepOf, { i: at + 1, n: steps.length })}</span>
              <ProgressDots
                states={steps.map((_, i) => (i < at ? 'right' : i === at ? 'current' : 'todo'))}
              />
            </div>
            <StepCard
              key={at}
              step={cur.step}
              solved={solved}
              onSolve={succeed}
              praise={PRAISE[at % PRAISE.length]!}
              next={{ label: t(S.next), onClick: advance }}
            />
          </>
        )}
      </Slot>
      <Confetti burst={burst} />
    </>
  );
}
