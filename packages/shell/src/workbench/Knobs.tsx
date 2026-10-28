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

/**
 * Every knob of the toy, compact enough for the stage's left edge: − value + steppers for numbers and
 * picture tiles for picks (which item to share…). Locked outside the lab and while ▶ plays.
 */
export function RailKnobs<A>({
  parts,
  dispatch,
  lang,
  locked,
}: {
  parts: ToyPart<A>[];
  dispatch: (a: A) => void;
  lang: Lang;
  locked: boolean;
}) {
  const t = useT();
  const knobs = parts.flatMap((p) => p.knobs ?? []);
  if (!knobs.length) return null;
  return (
    <section className="kg-rail-knobs" aria-label={t(S.changeParts)}>
      <span className="kg-rail-knobs__title">🎛️ {t(S.changeParts)}</span>
      {knobs.map((k) => {
        const label = pick(k.label, lang);
        if (k.kind === 'number') {
          const set = (v: number) => {
            const next = Math.max(k.min, Math.min(k.max, v));
            if (next !== k.value) dispatch(k.action(next));
          };
          return (
            <div key={k.id} className="kg-rail-knob" role="group" aria-label={label}>
              <span className="kg-rail-knob__label">{label}</span>
              <div className="kg-rail-knob__step">
                <button
                  type="button"
                  aria-label={`${label} ${t(S.less)}`}
                  onClick={() => set(k.value - 1)}
                  disabled={locked || k.value <= k.min}
                >
                  −
                </button>
                <output>{formatNumber(k.value, lang)}</output>
                <button
                  type="button"
                  aria-label={`${label} ${t(S.more)}`}
                  onClick={() => set(k.value + 1)}
                  disabled={locked || k.value >= k.max}
                >
                  +
                </button>
              </div>
            </div>
          );
        }
        return (
          <div key={k.id} className="kg-rail-knob" role="group" aria-label={label}>
            <span className="kg-rail-knob__label">{label}</span>
            <div className="kg-rail-knob__tiles">
              {k.options.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  aria-pressed={o.value === k.value}
                  disabled={locked}
                  onClick={() => o.value !== k.value && dispatch(k.action(o.value))}
                >
                  {o.icon}
                  <span>{pick(o.label, lang)}</span>
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </section>
  );
}
