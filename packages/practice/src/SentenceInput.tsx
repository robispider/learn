import type { Ask } from '@khelaghor/core';
import { pick, type Lang } from '@khelaghor/i18n';
import { EquationChips, Numpad, type EqPart, type NumpadKey } from '@khelaghor/ui';
import { useCallback, useEffect, useState } from 'react';
import { tokenize } from './engine';

/**
 * A number sentence with boxes to fill, e.g. "১৪ ÷ ৪ = [q], ভাগশেষ [r]". Tap a box, type on the
 * numpad (or keyboard), press ✓. Used by Try steps and Practice items.
 */
export function SentenceInput({
  ask,
  lang,
  marks,
  onSubmit,
  okLabel,
  disabled,
}: {
  ask: Ask;
  lang: Lang;
  /** Right/wrong per slot after a check. */
  marks?: Record<string, boolean>;
  onSubmit: (values: Record<string, number>) => void;
  okLabel: string;
  disabled?: boolean;
}) {
  const tokens = tokenize(pick(ask.template, lang));
  const slots = tokens.filter((t) => t.kind === 'slot').map((t) => t.id);
  const [values, setValues] = useState<Record<string, string>>({});
  const [focus, setFocus] = useState(slots[0] ?? '');
  const template = pick(ask.template, lang);

  // A new question clears the boxes.
  useEffect(() => {
    setValues({});
    setFocus(tokenize(template).find((t) => t.kind === 'slot')?.id ?? '');
  }, [template]);

  // Wrong boxes are cleared so the child can try again.
  useEffect(() => {
    if (!marks) return;
    const wrong = Object.entries(marks)
      .filter(([, ok]) => !ok)
      .map(([k]) => k);
    if (wrong.length) {
      setValues((v) => Object.fromEntries(Object.entries(v).filter(([k]) => !wrong.includes(k))));
      setFocus(wrong[0]!);
    }
  }, [marks]);

  const onKey = useCallback(
    (k: NumpadKey) => {
      if (disabled) return;
      if (k === 'ok') {
        const filled = slots.every((s) => values[s] !== undefined && values[s] !== '');
        if (!filled) {
          setFocus(slots.find((s) => !values[s]) ?? focus);
          return;
        }
        onSubmit(Object.fromEntries(slots.map((s) => [s, Number(values[s])])));
        return;
      }
      if (!focus) return;
      setValues((v) => {
        const cur = v[focus] ?? '';
        if (k === 'del') return { ...v, [focus]: cur.slice(0, -1) };
        if (cur.length >= 4) return v;
        return { ...v, [focus]: cur === '0' ? k : cur + k };
      });
    },
    [disabled, focus, onSubmit, slots, values],
  );

  const parts: EqPart[] = tokens.map((t) => {
    if (t.kind === 'text') return { kind: 'text', value: t.value };
    const v = values[t.id];
    return {
      kind: 'num',
      value: v === undefined || v === '' ? undefined : Number(v),
      color: ask.colors?.[t.id],
      label: ask.labels?.[t.id] ? pick(ask.labels[t.id], lang) : undefined,
      focus: focus === t.id && !disabled,
      state: marks?.[t.id] === undefined ? undefined : marks[t.id] ? 'right' : 'wrong',
      onClick: () => setFocus(t.id),
    };
  });

  return (
    <div style={{ display: 'grid', gap: 14 }}>
      <EquationChips parts={parts} lang={lang} />
      {!disabled && <Numpad lang={lang} onKey={onKey} okLabel={okLabel} />}
    </div>
  );
}
