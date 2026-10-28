import { useProgress, type Topic } from '@khelaghor/core';
import { pick } from '@khelaghor/i18n';
import { Button, Confetti } from '@khelaghor/ui';
import { playSfx } from '@khelaghor/voice';
import { useCallback, useState } from 'react';
import { useBook } from '../../book';
import { DialogueLine } from '../../components/Dialogue';
import { useLang, useT } from '../../hooks';
import { S } from '../../strings';
import { Slot, useHintButton } from '../context';
import { PanelHead, Tips } from '../PanelBits';
import { ToyStage, useLessonToy } from '../ToyStage';

/** ❓ মূল প্রশ্ন: the book's question, the story hook, and free play with the toy until the goal is reached. */
export function ExploreMode({ topic, onNext }: { topic: Topic; onNext: () => void }) {
  const book = useBook();
  const lang = useLang();
  const t = useT();
  const mark = useProgress((s) => s.mark);
  const { explore } = topic;
  const lt = useLessonToy(explore.toy, explore.config);
  const [line, setLine] = useState(0);
  const [done, setDone] = useState(false);
  const [burst, setBurst] = useState(0);
  const [tip, setTip] = useState(-1);
  const hook = explore.hook[line]!;
  const lastLine = line >= explore.hook.length - 1;
  const tips = lt.toy.tips ?? [];
  useHintButton(!done && tips.length ? () => setTip((i) => (i + 1) % tips.length) : null);

  const onState = useCallback(
    (state: unknown) => {
      if (done || explore.goal === undefined || !lt.toy.check) return;
      if (lt.toy.check(state, explore.goal)) {
        setDone(true);
        setBurst((b) => b + 1);
        playSfx('cheer');
        mark(book.data.id, topic.id, { explored: true });
      }
    },
    [book.data.id, done, explore.goal, mark, lt.toy, topic.id],
  );

  return (
    <>
      <Slot name="stage">
        <ToyStage lt={lt} onState={onState} />
      </Slot>
      <Slot name="panel">
        <PanelHead topic={topic} />
        <div className="kg-question">
          <span className="kg-kicker">
            {book.data.modeSymbols.explore?.symbol} {pick(book.data.modeSymbols.explore?.name, lang)}
          </span>
          <p>{pick(topic.question, lang)}</p>
        </div>
        {done ? (
          <DialogueLine
            speaker={book.data.companion}
            text={explore.done ?? S.exploreDone}
            pose="cheer"
            expression="proud"
          />
        ) : (
          <DialogueLine
            speaker={hook.say}
            text={hook.text}
            pose={hook.pose}
            expression={hook.expression}
            key={line}
          />
        )}
        {tip >= 0 && !done && (
          <DialogueLine
            speaker={book.data.companion}
            text={tips[tip]!}
            pose="think"
            size={60}
            key={`tip${tip}`}
          />
        )}
        <div className="kg-panel-actions">
          {!done && !lastLine && (
            <Button variant="primary" size="lg" onClick={() => setLine((l) => l + 1)}>
              ▶ {t(S.next)}
            </Button>
          )}
          {(done || lastLine || explore.goal === undefined) && (
            <Button
              variant={done || explore.goal === undefined ? 'primary' : 'default'}
              size="lg"
              onClick={() => {
                mark(book.data.id, topic.id, { explored: true });
                onNext();
              }}
            >
              {book.data.modeSymbols.try?.symbol} {t(S.goTry)}
            </Button>
          )}
        </div>
        <Tips tips={tips} />
      </Slot>
      <Confetti burst={burst} />
    </>
  );
}
