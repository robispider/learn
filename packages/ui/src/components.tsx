import { formatNumber, type Lang } from '@khelaghor/i18n';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useEffect, useMemo, type ButtonHTMLAttributes, type ReactNode } from 'react';

type BtnProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'default' | 'primary' | 'good' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
};

export function Button({ variant = 'default', size = 'md', className = '', ...rest }: BtnProps) {
  const cls = [
    'kg-btn',
    variant !== 'default' && `kg-btn--${variant}`,
    size !== 'md' && `kg-btn--${size}`,
    className,
  ]
    .filter(Boolean)
    .join(' ');
  return <button type="button" className={cls} {...rest} />;
}

export function IconButton({
  label,
  className = '',
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { label: string }) {
  return (
    <button type="button" className={`kg-icon-btn ${className}`} aria-label={label} title={label} {...rest} />
  );
}

export type BubbleColor = 'yellow' | 'pink' | 'blue' | 'lavender' | 'green';

export function SpeechBubble({
  color = 'blue',
  name,
  children,
  active,
  tail,
  action,
}: {
  color?: BubbleColor;
  name?: string;
  children: ReactNode;
  active?: boolean;
  tail?: 'left';
  action?: ReactNode;
}) {
  return (
    <div
      className={`kg-bubble ${tail ? `kg-bubble--tail-${tail}` : ''}`}
      data-color={color}
      data-active={active}
    >
      <div className="kg-bubble__text">
        {name && <span className="kg-bubble__name">{name}</span>}
        {children}
      </div>
      {action}
    </div>
  );
}

export type TabItem = { id: string; symbol?: ReactNode; label: string; done?: boolean };

export function Tabs({
  items,
  value,
  onChange,
  label,
}: {
  items: TabItem[];
  value: string;
  onChange: (id: string) => void;
  label: string;
}) {
  return (
    <div className="kg-tabs" role="tablist" aria-label={label}>
      {items.map((t) => (
        <button
          key={t.id}
          type="button"
          role="tab"
          className="kg-tab"
          aria-selected={t.id === value}
          onClick={() => onChange(t.id)}
        >
          {t.symbol && <span className="kg-tab__symbol">{t.symbol}</span>}
          {t.label}
          {t.done && <span className="kg-tab__done">✓</span>}
        </button>
      ))}
    </div>
  );
}

export type NumpadKey = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | 'del' | 'ok';

/** Big on-screen number pad. Also listens to the physical keyboard while mounted. */
export function Numpad({
  lang,
  onKey,
  okLabel,
}: {
  lang: Lang;
  onKey: (k: NumpadKey) => void;
  okLabel: string;
}) {
  useEffect(() => {
    const onDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const bn = '০১২৩৪৫৬৭৮৯'.indexOf(e.key);
      if (/^[0-9]$/.test(e.key)) onKey(e.key as NumpadKey);
      else if (bn >= 0) onKey(String(bn) as NumpadKey);
      else if (e.key === 'Backspace') onKey('del');
      else if (e.key === 'Enter') onKey('ok');
      else return;
      e.preventDefault();
    };
    window.addEventListener('keydown', onDown);
    return () => window.removeEventListener('keydown', onDown);
  }, [onKey]);
  const keys: NumpadKey[] = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'del', '0', 'ok'];
  return (
    <div className="kg-numpad">
      {keys.map((k) => (
        <button
          key={k}
          type="button"
          className={k === 'ok' ? 'kg-numpad__ok' : k === 'del' ? 'kg-numpad__del' : undefined}
          aria-label={k === 'del' ? '⌫' : k === 'ok' ? okLabel : k}
          onClick={() => onKey(k)}
        >
          {k === 'del' ? '⌫' : k === 'ok' ? '✓' : formatNumber(Number(k), lang)}
        </button>
      ))}
    </div>
  );
}

export type ChipColor = 'dividend' | 'divisor' | 'quotient' | 'remainder' | 'plain';
export type EqPart =
  | {
      kind: 'num';
      value?: number | string;
      color?: ChipColor;
      label?: string;
      focus?: boolean;
      state?: 'right' | 'wrong';
      onClick?: () => void;
    }
  | { kind: 'op'; value: string }
  | { kind: 'text'; value: string };

/** A number sentence drawn like the book: coloured number chips with a label under each. */
export function EquationChips({ parts, lang }: { parts: EqPart[]; lang: Lang }) {
  return (
    <div className="kg-eq" aria-live="polite">
      {parts.map((p, i) => {
        if (p.kind === 'op')
          return (
            <span key={i} className="kg-eq__op">
              {p.value}
            </span>
          );
        if (p.kind === 'text')
          return (
            <span key={i} className="kg-eq__text">
              {p.value}
            </span>
          );
        const empty = p.value === undefined || p.value === '';
        const shown = empty ? '?' : typeof p.value === 'number' ? formatNumber(p.value, lang) : p.value;
        const Tag = p.onClick ? 'button' : 'span';
        return (
          <span key={i} className="kg-eq__item">
            <Tag
              type={p.onClick ? 'button' : undefined}
              className="kg-chip"
              data-color={p.color ?? 'plain'}
              data-empty={empty}
              data-focus={p.focus}
              data-state={p.state}
              onClick={p.onClick}
            >
              {shown}
            </Tag>
            {p.label && <span className="kg-chip__label">{p.label}</span>}
          </span>
        );
      })}
    </div>
  );
}

export function Stars({ n, of = 3, size = 20 }: { n: number; of?: number; size?: number }) {
  return (
    <span className="kg-stars" style={{ fontSize: size }} aria-label={`${n}/${of}`}>
      {Array.from({ length: of }, (_, i) => (
        <span key={i} className={i < n ? 'kg-stars__on' : 'kg-stars__off'}>
          ★
        </span>
      ))}
    </span>
  );
}

export function ProgressChip({ stars, total, lang }: { stars: number; total: number; lang: Lang }) {
  return (
    <span className="kg-progress-chip" title="⭐">
      <span className="kg-stars__on">★</span>
      {formatNumber(stars, lang)}/{formatNumber(total, lang)}
    </span>
  );
}

export function ProgressDots({ states }: { states: ('todo' | 'right' | 'helped' | 'current')[] }) {
  return (
    <div className="kg-dots" aria-hidden>
      {states.map((s, i) => (
        <span key={i} data-s={s} />
      ))}
    </div>
  );
}

const BN_MARKS = ['ক', 'খ', 'গ', 'ঘ'];
const EN_MARKS = ['a', 'b', 'c', 'd'];

export function Choices({
  options,
  lang,
  states,
  onPick,
}: {
  options: string[];
  lang: Lang;
  states?: ('right' | 'wrong' | undefined)[];
  onPick: (i: number) => void;
}) {
  const marks = lang === 'bn' ? BN_MARKS : EN_MARKS;
  return (
    <div className="kg-choices">
      {options.map((o, i) => (
        <button
          key={i}
          type="button"
          className="kg-choice"
          data-state={states?.[i]}
          onClick={() => onPick(i)}
        >
          <span className="kg-choice__mark">{marks[i]}</span>
          {o}
        </button>
      ))}
    </div>
  );
}

export function RuleCard({ children }: { children: ReactNode }) {
  return <div className="kg-rule">{children}</div>;
}

export function Sheet({
  open,
  onClose,
  children,
  label,
}: {
  open: boolean;
  onClose?: () => void;
  children: ReactNode;
  label: string;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="kg-sheet-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="kg-card kg-sheet"
            role="dialog"
            aria-modal="true"
            aria-label={label}
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            onClick={(e) => e.stopPropagation()}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

const CONFETTI_COLORS = ['#ff7a45', '#24a99a', '#ffe14d', '#f78fb3', '#3ec6f0', '#b58bd9', '#2ead5b'];

/** A burst of paper confetti. Renders nothing when reduced motion is on. Change `burst` to fire again. */
export function Confetti({ burst }: { burst: number }) {
  const reduce = useReducedMotion();
  const pieces = useMemo(
    () =>
      Array.from({ length: 36 }, (_, i) => ({
        id: `${burst}-${i}`,
        x: 50 + (Math.random() - 0.5) * 30,
        dx: (Math.random() - 0.5) * 90,
        rot: Math.random() * 720 - 360,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        delay: Math.random() * 0.15,
        w: 8 + Math.random() * 8,
      })),
    [burst],
  );
  if (!burst || reduce) return null;
  return (
    <div className="kg-confetti" aria-hidden key={burst}>
      {pieces.map((p) => (
        <motion.span
          key={p.id}
          style={{
            position: 'absolute',
            top: '40%',
            left: `${p.x}%`,
            width: p.w,
            height: p.w * 0.6,
            background: p.color,
            borderRadius: 2,
          }}
          initial={{ y: 0, x: 0, opacity: 1, rotate: 0 }}
          animate={{ y: [0, -220, 420], x: [0, p.dx * 2, p.dx * 3], opacity: [1, 1, 0], rotate: p.rot }}
          transition={{ duration: 1.6, delay: p.delay, ease: 'easeOut' }}
        />
      ))}
    </div>
  );
}
