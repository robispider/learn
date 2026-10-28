import { formatNumber, pick, type Lang } from '@khelaghor/i18n';
import type { ToyKnob, ToyPart } from '@khelaghor/stage';
import { IconButton } from '@khelaghor/ui';
import { useLang, useT } from '../hooks';
import { S } from '../strings';

/** One setting of a toy part: − value + with a slider, or a row of picture buttons. */
export function KnobControl<A>({ knob, dispatch }: { knob: ToyKnob<A>; dispatch: (a: A) => void }) {
  const lang = useLang();
  const t = useT();
  const label = pick(knob.label, lang);
  if (knob.kind === 'number') {
    const set = (v: number) => {
      const next = Math.max(knob.min, Math.min(knob.max, v));
      if (next !== knob.value) dispatch(knob.action(next));
    };
    return (
      <div className="kg-knob" role="group" aria-label={label}>
        <div className="kg-knob__row">
          <span className="kg-knob__label">{label}</span>
          <IconButton
            label={`${label} ${t(S.less)}`}
            onClick={() => set(knob.value - 1)}
            disabled={knob.value <= knob.min}
          >
            −
          </IconButton>
          <output className="kg-knob__value">{formatNumber(knob.value, lang)}</output>
          <IconButton
            label={`${label} ${t(S.more)}`}
            onClick={() => set(knob.value + 1)}
            disabled={knob.value >= knob.max}
          >
            +
          </IconButton>
        </div>
        <input
          type="range"
          className="kg-knob__slider"
          min={knob.min}
          max={knob.max}
          value={knob.value}
          aria-label={label}
          aria-valuetext={formatNumber(knob.value, lang)}
          onChange={(e) => set(Number(e.target.value))}
        />
      </div>
    );
  }
  return (
    <div className="kg-knob" role="group" aria-label={label}>
      <span className="kg-knob__label">{label}</span>
      <div className="kg-knob__choices">
        {knob.options.map((o) => (
          <button
            key={o.value}
            type="button"
            className="kg-knob__choice"
            aria-pressed={o.value === knob.value}
            onClick={() => o.value !== knob.value && dispatch(knob.action(o.value))}
          >
            {o.icon}
            <span>{pick(o.label, lang)}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/** Every part that has settings, as a list (the lab panel's "change the parts"). */
export function KnobList<A>({
  parts,
  dispatch,
  lang,
}: {
  parts: ToyPart<A>[];
  dispatch: (a: A) => void;
  lang: Lang;
}) {
  const withKnobs = parts.filter((p) => p.knobs?.length);
  if (!withKnobs.length) return null;
  return (
    <div className="kg-knob-list">
      {withKnobs.map((p) => (
        <section key={p.id} className="kg-knob-group">
          <h4>
            <span aria-hidden>{p.icon}</span> {pick(p.title, lang)}
          </h4>
          {p.knobs!.map((k) => (
            <KnobControl key={k.id} knob={k} dispatch={dispatch} />
          ))}
        </section>
      ))}
    </div>
  );
}
