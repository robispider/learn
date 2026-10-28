import { useProgress, type Step, type Topic } from '@khelaghor/core';
import { pick } from '@khelaghor/i18n';
import { SentenceInput } from '@khelaghor/practice';
import { Button, Choices, Confetti, ProgressDots } from '@khelaghor/ui';
import { playSfx } from '@khelaghor/voice';
import { useCallback, useMemo, useRef, useState } from 'react';
import { useBook } from '../../book';
import { DialogueLine } from '../../components/Dialogue';
import { ToyPanel } from '../../components/ToyPanel';
import { useLang, useT } from '../../hooks';
import { PRAISE, S } from '../../strings';

type Flat = { block: number; step: Step; index: number };

/** ▲ কাজ: guided steps. A step is done when the toy reaches `expect`, the boxes are right, or the right choice is picked. */
export function TryMode({ topic, onNext }: { topic: Topic; onNext: () => void }) {
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
  const [hint, setHint] = useState(0);
  const [wrong, setWrong] = useState<{ text: string } | null>(null);
  const [marks, setMarks] = useState<Record<string, boolean>>();
  const [choiceStates, setChoiceStates] = useState<('right' | 'wrong' | undefined)[]>([]);
  const [finished, setFinished] = useState(false);
  const [burst, setBurst] = useState(0);
  const toyState = useRef<unknown>(null);

  const cur = steps[at]!;
  const block = topic.try[cur.block]!;
  const toy = book.toy(block.toy);
  // The toy uses the latest `setup` at or before this step in its block.
  const config = useMemo(() => {
    let c = block.config;
    for (const s of block.steps.slice(0, cur.index + 1)) if (s.setup !== undefined) c = s.setup;
    return c;
  }, [block, cur.index]);

  const succeed = useCallback(() => {
    setSolved(true);
    setWrong(null);
    playSfx('success');
  }, []);

  const onState = useCallback(
    (state: unknown) => {
      toyState.current = state;
      if (!solved && cur.step.expect !== undefined && toy.check?.(state, cur.step.expect)) succeed();
    },
    [cur.step.expect, solved, succeed, toy],
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
    setHint(0);
    setWrong(null);
    setMarks(undefined);
    setChoiceStates([]);
  };

  const needsWork = cur.step.expect !== undefined || !!cur.step.ask || !!cur.step.choose;
  const praise = PRAISE[at % PRAISE.length]!;
  const hints = cur.step.hints ?? [];

  if (finished) {
    return (
      <div className="kg-lesson-grid">
        <div className="kg-lesson-main kg-center">
          <DialogueLine
            speaker={book.data.companion}
            text={S.tryDone}
            pose="cheer"
            expression="proud"
            size={140}
          />
          <div className="kg-panel-actions">
            <Button variant="primary" size="lg" onClick={onNext}>
              {book.data.modeSymbols.practice?.symbol} {t(S.goPractice)}
            </Button>
          </div>
        </div>
        <Confetti burst={burst} />
      </div>
    );
  }

  return (
    <div className="kg-lesson-grid">
      <div className="kg-lesson-main">
        {block.title && <h2 className="kg-h2">{pick(block.title, lang)}</h2>}
        <ToyPanel toyId={block.toy} config={config} onState={onState} />
      </div>
      <aside className="kg-lesson-panel">
        <div className="kg-panel-top">
          <div className="kg-step-head">
            <span className="kg-badge">{t(S.stepOf, { i: at + 1, n: steps.length })}</span>
            <ProgressDots states={steps.map((_, i) => (i < at ? 'right' : i === at ? 'current' : 'todo'))} />
          </div>
          <DialogueLine
            speaker={cur.step.say}
            text={cur.step.text}
            pose={cur.step.pose}
            expression={cur.step.expression}
            key={at}
          />
        </div>
        <div className="kg-panel-rest">
          {cur.step.ask && (
            <SentenceInput
              ask={cur.step.ask}
              lang={lang}
              marks={marks}
              disabled={solved}
              okLabel={t(S.check)}
              onSubmit={(values) => {
                const m = Object.fromEntries(
                  Object.entries(cur.step.ask!.answers).map(([k, v]) => [k, values[k] === v]),
                );
                setMarks(m);
                if (Object.values(m).every(Boolean)) succeed();
                else {
                  playSfx('oops');
                  setWrong({ text: t(S.tryAgain) });
                  setHint((h) => Math.min(h + 1, hints.length));
                }
              }}
            />
          )}

          {cur.step.choose && (
            <Choices
              options={cur.step.choose.options.map((o) => pick(o, lang))}
              lang={lang}
              states={choiceStates}
              onPick={(i) => {
                if (solved) return;
                const right = i === cur.step.choose!.answer;
                setChoiceStates((s) => {
                  const n = [...s];
                  n[i] = right ? 'right' : 'wrong';
                  return n;
                });
                const reply = cur.step.choose!.replies?.[i];
                if (right) {
                  succeed();
                } else {
                  playSfx('oops');
                  setWrong({ text: reply ? pick(reply, lang) : t(S.tryAgain) });
                }
              }}
            />
          )}

          {cur.step.expect !== undefined && !solved && <p className="kg-muted">👆 {t(S.doToy)}</p>}

          {wrong && !solved && (
            <p className="kg-feedback" data-tone="warn" role="status">
              {wrong.text}
            </p>
          )}

          {hint > 0 && !solved && hints[hint - 1] && (
            <DialogueLine
              speaker={book.data.companion}
              text={hints[hint - 1]!}
              pose="think"
              size={64}
              key={`hint-${hint}`}
            />
          )}

          {solved && (
            <DialogueLine
              speaker={cur.step.success ? cur.step.say : book.data.companion}
              text={cur.step.success ?? praise}
              pose="cheer"
              expression="proud"
              size={72}
              key={`ok-${at}`}
            />
          )}

          <div className="kg-panel-actions">
            {!solved && hints.length > 0 && hint < hints.length && (
              <Button onClick={() => setHint((h) => h + 1)}>💡 {t(S.hint)}</Button>
            )}
            {(solved || !needsWork) && (
              <Button variant="primary" size="lg" onClick={advance} autoFocus>
                ▶ {t(S.next)}
              </Button>
            )}
          </div>
        </div>
      </aside>
      <Confetti burst={solved ? at + 1 : 0} />
    </div>
  );
}
