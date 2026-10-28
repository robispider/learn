import { createRng, randomSeed } from '@khelaghor/core';
import { tr } from '@khelaghor/i18n';
import type { GameDefinition, GameProps } from '@khelaghor/stage';
import { Button, Confetti } from '@khelaghor/ui';
import { playSfx } from '@khelaghor/voice';
import { useEffect, useMemo, useRef, useState } from 'react';
import { PlatesControls } from '../plates-and-packs/Controls';
import { configSchema, init, reducer, summarize, type Action, type State } from '../plates-and-packs/model';
import { PlatesView2D } from '../plates-and-packs/View2D';
import { RUSH_STRINGS } from './strings';

const SECONDS = 60;

function makeRound(seed: number, round: number): State {
  const rng = createRng(seed + round * 7919);
  const plates = rng.int(2, Math.min(5, 2 + Math.floor(round / 2)));
  const each = rng.int(1, Math.min(5, 2 + Math.floor(round / 2)));
  const left = round >= 2 && rng.next() < 0.4 ? rng.int(1, plates - 1) : 0;
  return init(
    configSchema.parse({
      mode: 'share',
      total: plates * each + left,
      plates,
      item: rng.pick(['biscuit', 'orange', 'lemon'] as const),
      allowUnfair: false,
    }),
  );
}

function Rush({ lang, onFinish }: GameProps) {
  const [phase, setPhase] = useState<'ready' | 'play' | 'over'>('ready');
  const seed = useMemo(() => randomSeed(), []);
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [left, setLeft] = useState(SECONDS);
  const [s, setS] = useState<State>(() => makeRound(seed, 0));
  const [burst, setBurst] = useState(0);
  const finished = useRef(false);
  const dispatch = (a: Action) => phase === 'play' && setS((cur) => reducer(cur, a));

  useEffect(() => {
    if (phase !== 'play') return;
    const t = setInterval(() => setLeft((l) => l - 1), 1000);
    return () => clearInterval(t);
  }, [phase]);

  useEffect(() => {
    if (phase !== 'play') return;
    if (left <= 5 && left > 0) playSfx('tick');
    if (left <= 0) {
      setPhase('over');
      if (!finished.current) {
        finished.current = true;
        playSfx('cheer');
        onFinish({ score, stars: score >= 8 ? 3 : score >= 5 ? 2 : 1 });
      }
    }
  }, [left, phase, score, onFinish]);

  // A finished share scores and the next table appears.
  const done = summarize(s).done;
  useEffect(() => {
    if (phase !== 'play' || !done) return;
    setScore((n) => n + 1);
    setBurst((b) => b + 1);
    const t = setTimeout(() => {
      playSfx('whoosh');
      setRound((r) => r + 1);
      setS(makeRound(seed, round + 1));
    }, 900);
    return () => clearTimeout(t);
  }, [done, phase, round, seed]);

  const start = () => {
    finished.current = false;
    setScore(0);
    setLeft(SECONDS);
    setRound(0);
    setS(makeRound(seed + Date.now(), 0));
    setPhase('play');
  };

  return (
    <div className="kg-game">
      <div className="kg-game__bar">
        <span className="kg-progress-chip">⏱ {tr(RUSH_STRINGS.time, lang, { t: Math.max(0, left) })}</span>
        <span className="kg-progress-chip">⭐ {tr(RUSH_STRINGS.score, lang, { n: score })}</span>
      </div>
      <div className="kg-stage kg-stage--game">
        <PlatesView2D state={s} dispatch={dispatch} lang={lang} readOnly={phase !== 'play'} />
        {phase !== 'play' && (
          <div className="kg-game__overlay">
            <div className="kg-card" style={{ maxWidth: 440, textAlign: 'center', display: 'grid', gap: 14 }}>
              <strong style={{ fontSize: 24 }}>{tr(RUSH_STRINGS.title, lang)}</strong>
              <p style={{ margin: 0 }}>
                {phase === 'ready' ? tr(RUSH_STRINGS.howTo, lang) : tr(RUSH_STRINGS.over, lang, { n: score })}
              </p>
              <Button variant="primary" size="lg" onClick={start}>
                {phase === 'ready' ? tr(RUSH_STRINGS.start, lang) : tr(RUSH_STRINGS.again, lang)}
              </Button>
            </div>
          </div>
        )}
      </div>
      {phase === 'play' && <PlatesControls state={s} dispatch={dispatch} lang={lang} readOnly />}
      <Confetti burst={burst} />
    </div>
  );
}

export const plateDealerRush: GameDefinition = {
  id: 'plate-dealer-rush',
  kit: 'operations',
  title: RUSH_STRINGS.title,
  howTo: RUSH_STRINGS.howTo,
  component: Rush,
};
