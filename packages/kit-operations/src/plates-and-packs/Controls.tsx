import { formatNumber, pick, tr, type Lang } from '@khelaghor/i18n';
import type { ToyViewProps } from '@khelaghor/stage';
import { Button, IconButton, type EqPart } from '@khelaghor/ui';
import { playSfx } from '@khelaghor/voice';
import { useEffect, useRef } from 'react';
import { LIMITS, summarize, type Action, type State } from './model';
import { ITEM_NAMES, S } from './strings';

/** One-line status, also used as the screen-reader description. */
export function describe(s: State, lang: Lang): string {
  const sum = summarize(s);
  if (s.config.mode === 'share') {
    if (s.notice === 'not-enough' && !sum.done) return tr(S.shareNotEnough, lang);
    if (sum.done)
      return tr(sum.remainder ? S.shareDoneLeft : S.shareDone, lang, { n: sum.quotient, r: sum.remainder });
    if (!sum.fair) return tr(S.unfair, lang);
    if (sum.pile === s.total) return tr(S.shareStart, lang);
    return tr(S.shareProgress, lang, { n: sum.rounds, p: sum.pile });
  }
  if (s.notice === 'full') return tr(S.packFull, lang);
  if (s.notice === 'not-enough' && !sum.done) return tr(S.groupNotEnough, lang);
  if (sum.done)
    return tr(sum.remainder ? S.groupDoneLeft : S.groupDone, lang, { k: sum.quotient, r: sum.remainder });
  if (sum.pile === s.total) return tr(S.groupStart, lang);
  return tr(S.groupProgress, lang, { k: sum.quotient, p: sum.pile });
}

/** The live number sentence, with the book's coloured chips. */
export function toEquation(s: State, lang: Lang): EqPart[] {
  const sum = summarize(s);
  const item = pick(ITEM_NAMES[s.config.item], lang);
  const terms = s.config.labels === 'terms';
  const L = terms ? S.terms : s.config.mode === 'share' ? S.shareLabels : S.groupLabels;
  const label = (k: 'dividend' | 'divisor' | 'quotient') => tr(L[k], lang, { item });
  const parts: EqPart[] = [
    { kind: 'num', value: s.total, color: 'dividend', label: label('dividend') },
    { kind: 'op', value: '÷' },
    {
      kind: 'num',
      value: s.config.mode === 'share' ? s.plates : s.size,
      color: 'divisor',
      label: label('divisor'),
    },
    { kind: 'op', value: '=' },
    { kind: 'num', value: sum.done ? sum.quotient : undefined, color: 'quotient', label: label('quotient') },
  ];
  if (sum.done && sum.remainder > 0) {
    parts.push({ kind: 'text', value: `, ${pick(S.leftWord, lang)}` });
    parts.push({
      kind: 'num',
      value: sum.remainder,
      color: 'remainder',
      label: pick(S.terms.remainder, lang),
    });
  }
  return parts;
}

function Stepper({
  label,
  value,
  onChange,
  lang,
  range,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  lang: Lang;
  range: readonly [number, number];
}) {
  return (
    <div className="kg-stepper" role="group" aria-label={label}>
      <span className="kg-stepper__label">{label}</span>
      <IconButton
        label={`${label} ${pick(S.less, lang)}`}
        onClick={() => onChange(value - 1)}
        disabled={value <= range[0]}
      >
        −
      </IconButton>
      <span className="kg-stepper__value">{formatNumber(value, lang)}</span>
      <IconButton
        label={`${label} ${pick(S.more, lang)}`}
        onClick={() => onChange(value + 1)}
        disabled={value >= range[1]}
      >
        +
      </IconButton>
    </div>
  );
}

/** Sounds follow state changes, so every way of changing it (drag, tap, buttons, any view) is covered. */
function useToySounds(s: State) {
  const sum = summarize(s);
  const placed = s.total - sum.pile;
  const prev = useRef({ placed, nonce: s.nonce });
  useEffect(() => {
    if (s.nonce !== prev.current.nonce) {
      if (s.notice === 'done') playSfx('success');
      else if (s.notice === 'not-enough' || s.notice === 'full') playSfx('oops');
    } else if (placed !== prev.current.placed) playSfx(placed > prev.current.placed ? 'pop' : 'tap');
    prev.current = { placed, nonce: s.nonce };
  }, [s.nonce, s.notice, placed]);
}

export function PlatesControls({ state: s, dispatch, lang, readOnly }: ToyViewProps<State, Action>) {
  useToySounds(s);
  const sum = summarize(s);
  const share = s.config.mode === 'share';
  const status = describe(s, lang);
  const tone = sum.done
    ? 'good'
    : s.notice === 'not-enough' || s.notice === 'full' || !sum.fair
      ? 'warn'
      : 'info';
  return (
    <div className="kg-toy-controls">
      <p className="kg-toy-status" data-tone={tone} aria-live="polite">
        {status}
      </p>
      {!readOnly && (
        <div className="kg-toy-buttons">
          {share ? (
            <Button
              variant="primary"
              size="lg"
              onClick={() => dispatch({ type: 'deal' })}
              disabled={sum.done}
            >
              🤲 {tr(S.dealRound, lang)}
            </Button>
          ) : (
            <Button
              variant="primary"
              size="lg"
              onClick={() => dispatch({ type: 'pack' })}
              disabled={sum.done}
            >
              🛍️ {tr(S.makePack, lang, { n: s.size })}
            </Button>
          )}
        </div>
      )}
      {!readOnly && s.config.editable && (
        <div className="kg-toy-buttons">
          <Stepper
            label={`${pick(S.editTotal, lang)} ${pick(ITEM_NAMES[s.config.item], lang)}`}
            value={s.total}
            lang={lang}
            range={LIMITS.total}
            onChange={(v) => dispatch({ type: 'setTotal', value: v })}
          />
          {share ? (
            <Stepper
              label={pick(S.editPlates, lang)}
              value={s.plates}
              lang={lang}
              range={LIMITS.plates}
              onChange={(v) => dispatch({ type: 'setPlates', value: v })}
            />
          ) : (
            <Stepper
              label={pick(S.editSize, lang)}
              value={s.size}
              lang={lang}
              range={LIMITS.size}
              onChange={(v) => dispatch({ type: 'setSize', value: v })}
            />
          )}
        </div>
      )}
    </div>
  );
}
