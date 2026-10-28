import type { Step } from '@khelaghor/core';
import { pick } from '@khelaghor/i18n';
import { SentenceInput } from '@khelaghor/practice';
import { Button, Choices } from '@khelaghor/ui';
import { playSfx } from '@khelaghor/voice';
import { useState } from 'react';
import { useBook } from '../book';
import { DialogueLine } from '../components/Dialogue';
import { useLang, useT } from '../hooks';
import { S } from '../strings';
import { useHintButton } from './context';

/**
 * One guided step (a Try step or a lab challenge): who says what, the boxes or choices to answer, the
 * hint ladder (also on the stage's 💡), and the praise. Toy goals (`expect`) are checked by the caller,
 * who sets `solved`.
 */
export function StepCard({
  step,
  solved,
  onSolve,
  praise,
  next,
}: {
  step: Step;
  solved: boolean;
  onSolve: () => void;
  praise: Step['text'];
  /** The "next" button (shown when solved, or at once for a step with nothing to do). */
  next?: { label: string; onClick: () => void };
}) {
  const book = useBook();
  const lang = useLang();
  const t = useT();
  const [hint, setHint] = useState(0);
  const [wrong, setWrong] = useState<string | null>(null);
  const [marks, setMarks] = useState<Record<string, boolean>>();
  const [choiceStates, setChoiceStates] = useState<('right' | 'wrong' | undefined)[]>([]);
  const hints = step.hints ?? [];
  const needsWork = step.expect !== undefined || !!step.ask || !!step.choose;
  const moreHints = !solved && hint < hints.length;
  useHintButton(moreHints ? () => setHint((h) => h + 1) : null);

  const succeed = () => {
    setWrong(null);
    onSolve();
  };
  const miss = (text: string) => {
    playSfx('oops');
    setWrong(text);
    setHint((h) => Math.min(h + 1, hints.length));
  };

  return (
    <div className="kg-step">
      <DialogueLine speaker={step.say} text={step.text} pose={step.pose} expression={step.expression} />
      {step.ask && (
        <SentenceInput
          ask={step.ask}
          lang={lang}
          marks={marks}
          disabled={solved}
          okLabel={t(S.check)}
          onSubmit={(values) => {
            const m = Object.fromEntries(
              Object.entries(step.ask!.answers).map(([k, v]) => [k, values[k] === v]),
            );
            setMarks(m);
            if (Object.values(m).every(Boolean)) succeed();
            else miss(t(S.tryAgain));
          }}
        />
      )}
      {step.choose && (
        <Choices
          options={step.choose.options.map((o) => pick(o, lang))}
          lang={lang}
          states={choiceStates}
          onPick={(i) => {
            if (solved) return;
            const right = i === step.choose!.answer;
            setChoiceStates((s) => {
              const n = [...s];
              n[i] = right ? 'right' : 'wrong';
              return n;
            });
            const reply = step.choose!.replies?.[i];
            if (right) succeed();
            else miss(reply ? pick(reply, lang) : t(S.tryAgain));
          }}
        />
      )}
      {step.expect !== undefined && !solved && <p className="kg-muted">👆 {t(S.doToy)}</p>}
      {wrong && !solved && (
        <p className="kg-feedback" data-tone="warn" role="status">
          {wrong}
        </p>
      )}
      {hint > 0 && !solved && hints[hint - 1] && (
        <DialogueLine
          speaker={book.data.companion}
          text={hints[hint - 1]!}
          pose="think"
          size={60}
          key={`hint-${hint}`}
        />
      )}
      {solved && (
        <DialogueLine
          speaker={step.success ? step.say : book.data.companion}
          text={step.success ?? praise}
          pose="cheer"
          expression="proud"
          size={64}
        />
      )}
      <div className="kg-panel-actions">
        {moreHints && <Button onClick={() => setHint((h) => h + 1)}>💡 {t(S.hint)}</Button>}
        {next && (solved || !needsWork) && (
          <Button variant="primary" size="lg" onClick={next.onClick} autoFocus>
            ▶ {next.label}
          </Button>
        )}
      </div>
    </div>
  );
}
