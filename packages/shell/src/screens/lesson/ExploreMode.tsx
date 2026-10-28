import { useProgress, type Topic } from '@khelaghor/core';
import { Button, Confetti } from '@khelaghor/ui';
import { playSfx } from '@khelaghor/voice';
import { useCallback, useState } from 'react';
import { useBook } from '../../book';
import { DialogueLine } from '../../components/Dialogue';
import { ToyPanel } from '../../components/ToyPanel';
import { useT } from '../../hooks';
import { S } from '../../strings';

/** ❓ মূল প্রশ্ন: the story hook plus free play with the toy until the goal is reached. */
export function ExploreMode({ topic, onNext }: { topic: Topic; onNext: () => void }) {
  const book = useBook();
  const t = useT();
  const mark = useProgress((s) => s.mark);
  const { explore } = topic;
  const toy = book.toy(explore.toy);
  const [line, setLine] = useState(0);
  const [done, setDone] = useState(false);
  const [burst, setBurst] = useState(0);
  const hook = explore.hook[line]!;
  const lastLine = line >= explore.hook.length - 1;

  const onState = useCallback(
    (state: unknown) => {
      if (done || explore.goal === undefined || !toy.check) return;
      if (toy.check(state, explore.goal)) {
        setDone(true);
        setBurst((b) => b + 1);
        playSfx('cheer');
        mark(book.data.id, topic.id, { explored: true });
      }
    },
    [book.data.id, done, explore.goal, mark, toy, topic.id],
  );

  return (
    <div className="kg-lesson-grid">
      <div className="kg-lesson-main">
        <ToyPanel toyId={explore.toy} config={explore.config} onState={onState} />
      </div>
      <aside className="kg-lesson-panel">
        <div className="kg-panel-top">
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
        </div>
        <div className="kg-panel-actions kg-panel-rest">
          {!done && !lastLine && (
            <Button variant="primary" size="lg" onClick={() => setLine((l) => l + 1)}>
              ▶ {t(S.next)}
            </Button>
          )}
          {!done && lastLine && <p className="kg-muted">👆 {t(S.exploreHint)}</p>}
          {(done || explore.goal === undefined) && (
            <Button
              variant="primary"
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
      </aside>
      <Confetti burst={burst} />
    </div>
  );
}
