import { useProgress, useSettings, type Settings } from '@khelaghor/core';
import { parseNumber, type I18n } from '@khelaghor/i18n';
import { useCapability } from '@khelaghor/stage';
import { Button } from '@khelaghor/ui';
import { deviceVoiceName, voice } from '@khelaghor/voice';
import { useMemo, useState, type ReactNode } from 'react';
import { Link } from 'react-router';
import { useBook } from '../book';
import { TopBar } from '../components/TopBar';
import { useLang, useT } from '../hooks';
import { S } from '../strings';

function Choice<K extends keyof Settings>({
  label,
  field,
  options,
}: {
  label: string;
  field: K;
  options: { value: Settings[K]; label: I18n }[];
}) {
  const t = useT();
  const value = useSettings((s) => s[field]);
  const set = useSettings((s) => s.set);
  return (
    <div className="kg-setting">
      <span className="kg-setting__label">{label}</span>
      <div className="kg-segment" role="group" aria-label={label}>
        {options.map((o) => (
          <button
            key={String(o.value)}
            type="button"
            aria-pressed={value === o.value}
            onClick={() => set({ [field]: o.value } as Partial<Settings>)}
          >
            {t(o.label)}
          </button>
        ))}
      </div>
    </div>
  );
}

/** A simple grown-ups gate in front of settings, so a child doesn't wipe their stars by accident. */
function Gate({ children }: { children: ReactNode }) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('');
  const [wrong, setWrong] = useState(false);
  const q = useMemo(
    () => ({ a: 6 + Math.floor(Math.random() * 4), b: 6 + Math.floor(Math.random() * 4) }),
    [],
  );
  if (open) return <>{children}</>;
  return (
    <form
      className="kg-card kg-gate"
      onSubmit={(e) => {
        e.preventDefault();
        if (parseNumber(value) === q.a * q.b) setOpen(true);
        else setWrong(true);
      }}
    >
      <h2 className="kg-h2">🔒 {t(S.gateTitle)}</h2>
      <label htmlFor="kg-gate">{t(S.gateQ, q)}</label>
      <div className="kg-row">
        <input
          id="kg-gate"
          inputMode="numeric"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          autoFocus
        />
        <Button type="submit" variant="primary">
          ✓
        </Button>
      </div>
      {wrong && (
        <p className="kg-feedback" data-tone="warn">
          {t(S.gateWrong)}
        </p>
      )}
    </form>
  );
}

export function SettingsScreen() {
  const book = useBook();
  const lang = useLang();
  const t = useT();
  const cap = useCapability();
  const reset = useProgress((s) => s.reset);
  const settings = useSettings();
  const [confirm, setConfirm] = useState(false);
  const voiceName = deviceVoiceName(lang);
  const viewName = (v: string) => t(v === '3d' ? S.view3d : v === '2.5d' ? S.view25d : S.view2d);
  return (
    <div className="kg-screen">
      <TopBar back="/" title={`⚙ ${t(S.settings)}`} />
      <main className="kg-page kg-settings">
        <Gate>
          <div className="kg-card">
            <Choice
              label={t(S.sLanguage)}
              field="lang"
              options={[
                { value: 'bn', label: { bn: 'বাংলা', en: 'বাংলা' } },
                { value: 'en', label: { bn: 'English', en: 'English' } },
              ]}
            />
            <Choice
              label={t(S.sVoice)}
              field="voice"
              options={[
                { value: true, label: S.on },
                { value: false, label: S.off },
              ]}
            />
            <Choice
              label={t(S.sRate)}
              field="rate"
              options={[
                { value: 'slow', label: S.slow },
                { value: 'normal', label: S.normal },
              ]}
            />
            <Choice
              label={t(S.sSfx)}
              field="sfx"
              options={[
                { value: true, label: S.on },
                { value: false, label: S.off },
              ]}
            />
            <Choice
              label={t(S.sMotion)}
              field="reducedMotion"
              options={[
                { value: 'system', label: S.motionSystem },
                { value: 'on', label: S.motionLess },
                { value: 'off', label: S.motionFull },
              ]}
            />
            <Choice
              label={t(S.sView)}
              field="view"
              options={[
                { value: 'auto', label: S.viewLesson },
                { value: '2d', label: S.viewLite },
              ]}
            />
          </div>
          <div className="kg-card">
            <h2 className="kg-h2">📱 {t(S.sDevice)}</h2>
            <p>{voiceName ? t(S.deviceVoice, { v: voiceName }) : t(S.noVoice)}</p>
            <Button
              onClick={() =>
                void voice.speak({ text: t(S.voiceTest), lang, rate: settings.rate, speaker: 'tia' })
              }
            >
              🔊 {t(S.testVoice)}
            </Button>
            {cap && (
              <p className="kg-muted">
                {t(S.webgl, { v: cap.webgl2 ? 'WebGL2' : cap.webgl ? 'WebGL' : '—' })} ·{' '}
                {t(S.bestView, { v: viewName(cap.best) })} · {Math.round(cap.frameMs ?? 0)} ms
                {cap.memory ? ` · ${cap.memory} GB` : ''}
              </p>
            )}
          </div>
          <div className="kg-card">
            {confirm ? (
              <div className="kg-row" style={{ flexWrap: 'wrap' }}>
                <span>{t(S.resetConfirm)}</span>
                <Button
                  variant="primary"
                  onClick={() => {
                    reset(book.data.id);
                    setConfirm(false);
                  }}
                >
                  {t(S.yes)}
                </Button>
                <Button onClick={() => setConfirm(false)}>{t(S.no)}</Button>
              </div>
            ) : (
              <Button onClick={() => setConfirm(true)}>🗑 {t(S.reset)}</Button>
            )}
          </div>
          <Link to="/review" className="kg-btn">
            🧑‍🎨 {t(S.review)}
          </Link>
        </Gate>
      </main>
    </div>
  );
}
