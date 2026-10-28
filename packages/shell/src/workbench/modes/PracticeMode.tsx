import {
  createRng,
  nextLevel,
  practiceStars,
  randomSeed,
  useProgress,
  type Attempt,
  type Level,
  type Topic,
} from '@khelaghor/core';
import { formatNumber, pick } from '@khelaghor/i18n';
import {
  checkResponse,
  nextItem,
  SentenceInput,
  type CheckResult,
  type PracticeItem,
} from '@khelaghor/practice';
import { Button, Choices, Confetti, ProgressDots, Stars } from '@khelaghor/ui';
import { Sticker } from '@khelaghor/art';
import { playSfx } from '@khelaghor/voice';
import { motion } from 'motion/react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { useBook } from '../../book';
import { DialogueLine } from '../../components/Dialogue';
import { useLang, useT } from '../../hooks';
import { PRAISE, S } from '../../strings';
import { Slot, useHintButton } from '../context';
import { PanelHead } from '../PanelBits';
import { ToyStage, useLessonToy } from '../ToyStage';

type Done = { firstTry: boolean; usedWorked: boolean };

/** The item's picture: the toy, picture-only, in the stage. */
function Picture({ toyId, config }: { toyId: string; config: unknown }) {
  const lt = useLessonToy(toyId, config);
  return <ToyStage lt={lt} readOnly toolbar={false} code={false} />;
}

/** ■ অনুশীলন (check understanding): generated items, adaptive level, hint ladder, misconception feedback, stars and a sticker. */
export function PracticeMode({ topic }: { topic: Topic }) {
  const book = useBook();
  const lang = useLang();
  const t = useT();
  const nav = useNavigate();
  const progress = useProgress();
  const { templates, count, misconceptions } = topic.practice;
  const [round, setRound] = useState(0);
  const rng = useMemo(() => createRng(randomSeed() + round), [round]);
  const [level, setLevel] = useState<Level>('easy');
  const [item, setItem] = useState<PracticeItem>(() => nextItem(rng, templates, 'easy'));
  const [results, setResults] = useState<Done[]>([]);
  const [wrongs, setWrongs] = useState(0);
  const [hint, setHint] = useState(0);
  const [picture, setPicture] = useState(item.showPicture);
  const [check, setCheck] = useState<CheckResult | null>(null);
  const [choiceStates, setChoiceStates] = useState<('right' | 'wrong' | undefined)[]>([]);
  const [gaveUp, setGaveUp] = useState(false);
  const [end, setEnd] = useState<{ stars: 1 | 2 | 3; firstTry: number; newSticker: boolean } | null>(null);

  const index = results.length;
  const solved = !!check?.correct || gaveUp;
  const moreHint = () => {
    setHint((h) => h + 1);
    if (hint + 1 >= 2 && item.picture) setPicture(true);
  };
  useHintButton(!end && !solved && hint < 3 ? moreHint : null);

  const load = (next: PracticeItem) => {
    setItem(next);
    setWrongs(0);
    setHint(0);
    setPicture(next.showPicture);
    setCheck(null);
    setChoiceStates([]);
    setGaveUp(false);
  };

  const finishItem = (firstTry: boolean) => {
    const usedWorked = hint >= 3;
    const done = [...results, { firstTry, usedWorked }];
    setResults(done);
    progress.recordAttempt(book.data.id, topic.id, { correct: firstTry, usedWorked });
    const attempts: Attempt[] = done.map((d) => ({ correct: d.firstTry, usedWorked: d.usedWorked }));
    setLevel(nextLevel(level, attempts));
  };

  const submit = (res: CheckResult) => {
    setCheck(res);
    if (res.correct) {
      playSfx('success');
      finishItem(wrongs === 0);
      return;
    }
    playSfx('oops');
    const w = wrongs + 1;
    setWrongs(w);
    // Each miss climbs the hint ladder; the 2nd miss shows the picture.
    setHint((h) => Math.max(h, Math.min(3, w)));
    if (w >= 2 && item.picture) setPicture(true);
    if (w >= 3) {
      setGaveUp(true);
      finishItem(false);
    }
  };

  const next = () => {
    if (results.length >= count) {
      const firstTry = results.filter((r) => r.firstTry).length;
      const stars = practiceStars(firstTry, count);
      const before = progress.topic(book.data.id, topic.id);
      const newSticker = stars >= 2 && !before.sticker;
      progress.mark(book.data.id, topic.id, {
        bestPractice: Math.max(before.bestPractice, stars),
        sticker: before.sticker || stars >= 2,
      });
      setEnd({ stars, firstTry, newSticker });
      playSfx('cheer');
      return;
    }
    load(nextItem(rng, templates, level, item));
  };

  if (end) {
    const after = progress.topic(book.data.id, topic.id);
    const i = book.topics.findIndex((x) => x.topic.id === topic.id);
    const nextTopic = book.topics[i + 1]?.topic;
    return (
      <>
        <Slot name="stage">
          <div className="kg-canvas kg-canvas--center kg-end">
            <h2 className="kg-h1">{t(S.roundDone)}</h2>
            <Stars n={end.stars} size={54} />
            <p>{t(S.roundScore, { n: count, k: end.firstTry })}</p>
            {end.newSticker && (
              <motion.div
                initial={{ scale: 0, rotate: -30 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 180, damping: 12 }}
                className="kg-center"
              >
                <Sticker id={topic.sticker} size={140} />
                <strong>{t(S.newSticker)}</strong>
              </motion.div>
            )}
          </div>
        </Slot>
        <Slot name="panel">
          <PanelHead topic={topic} />
          {after.mastered && (
            <p className="kg-feedback" data-tone="good">
              {t(S.mastered)}
            </p>
          )}
          <div className="kg-panel-actions">
            <Button
              size="lg"
              onClick={() => {
                setRound((r) => r + 1);
                setResults([]);
                setEnd(null);
                setLevel('easy');
                load(nextItem(createRng(randomSeed()), templates, 'easy'));
              }}
            >
              ↺ {t(S.playAgain)}
            </Button>
            {nextTopic ? (
              <Button variant="primary" size="lg" onClick={() => nav(`/t/${nextTopic.id}/explore`)}>
                ▶ {t(S.nextTopic)}
              </Button>
            ) : (
              <Button variant="primary" size="lg" onClick={() => nav('/')}>
                🗺️ {t(S.home)}
              </Button>
            )}
          </div>
        </Slot>
        <Confetti burst={1} />
      </>
    );
  }

  const dots = Array.from({ length: count }, (_, k) =>
    k < results.length ? (results[k]!.firstTry ? 'right' : 'helped') : k === index ? 'current' : 'todo',
  ) as ('right' | 'helped' | 'current' | 'todo')[];
  const answerText = item.ask
    ? Object.values(item.ask.answers)
        .map((v) => formatNumber(v, lang))
        .join(', ')
    : item.choose
      ? pick(item.choose.options[item.choose.answer], lang)
      : '';

  return (
    <>
      <Slot name="stage">
        {item.picture && picture ? (
          <Picture toyId={item.picture.toy} config={item.picture.config} key={item.id} />
        ) : (
          <div className="kg-canvas kg-canvas--center">
            <DialogueLine speaker={item.speaker} text={item.prompt} key={item.id} size={120} />
          </div>
        )}
      </Slot>
      <Slot name="panel">
        <PanelHead topic={topic} />
        <div>
          <div className="kg-step-head">
            <span className="kg-badge">
              {t(S.itemOf, { i: Math.min(index + (solved ? 0 : 1), count), n: count })}
            </span>
            <ProgressDots states={dots} />
          </div>
          {item.picture && picture && (
            <DialogueLine speaker={item.speaker} text={item.prompt} key={item.id} size={72} />
          )}
        </div>
        <div className="kg-step">
          {item.ask && (
            <SentenceInput
              ask={item.ask}
              lang={lang}
              marks={check?.slots}
              disabled={solved}
              okLabel={t(S.check)}
              onSubmit={(values) => submit(checkResponse(item, { kind: 'ask', values }, misconceptions))}
            />
          )}
          {item.choose && (
            <Choices
              options={item.choose.options.map((o) => pick(o, lang))}
              lang={lang}
              states={choiceStates}
              onPick={(i) => {
                if (solved) return;
                const res = checkResponse(item, { kind: 'choose', index: i }, misconceptions);
                setChoiceStates((s) => {
                  const n = [...s];
                  n[i] = res.correct ? 'right' : 'wrong';
                  return n;
                });
                submit(res);
              }}
            />
          )}

          {check && !check.correct && !gaveUp && (
            <p className="kg-feedback" data-tone="warn" role="status">
              {check.misconception ? pick(check.misconception.explain, lang) : t(S.tryAgain)}
            </p>
          )}
          {hint > 0 && !solved && (
            <DialogueLine
              speaker={book.data.companion}
              text={item.hints[hint - 1]!}
              pose="think"
              size={64}
              key={`h${item.id}${hint}`}
            />
          )}
          {check?.correct && (
            <DialogueLine
              speaker={book.data.companion}
              text={PRAISE[index % PRAISE.length]!}
              pose="cheer"
              expression="proud"
              size={64}
              key={`ok${item.id}`}
            />
          )}
          {gaveUp && (
            <>
              <DialogueLine
                speaker={book.data.companion}
                text={item.hints[2]}
                pose="point"
                size={64}
                key={`gu${item.id}`}
              />
              <p className="kg-feedback" data-tone="info">
                {t(S.answerWas)} {answerText}
              </p>
            </>
          )}

          <div className="kg-panel-actions">
            {!solved && hint < 3 && <Button onClick={moreHint}>💡 {t(S.hint)}</Button>}
            {!solved && item.picture && (
              <Button onClick={() => setPicture((p) => !p)}>
                {picture ? `🙈 ${t(S.hideMe)}` : `👀 ${t(S.showMe)}`}
              </Button>
            )}
            {solved && (
              <Button variant="primary" size="lg" onClick={next} autoFocus>
                ▶ {results.length >= count ? t(S.roundDone) : t(S.nextItem)}
              </Button>
            )}
          </div>
        </div>
      </Slot>
      <Confetti burst={check?.correct ? index : 0} />
    </>
  );
}
