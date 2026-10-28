import { pick } from '@khelaghor/i18n';
import { readAnchors, type AnchorPoint, type ToyPart } from '@khelaghor/stage';
import { Button, IconButton } from '@khelaghor/ui';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useLang, useSay, useT } from '../hooks';
import { S } from '../strings';
import { useWb } from './context';
import { KnobControl } from './Knobs';

/** Re-reads anchor positions when the scene moves, resizes or swaps view. */
function useAnchors(el: HTMLElement, dep: unknown) {
  const [pts, setPts] = useState<AnchorPoint[]>([]);
  const [size, setSize] = useState({ w: 0, h: 0 });
  useLayoutEffect(() => {
    // A short timer, not requestAnimationFrame: rAF pauses in background tabs and would leave no callouts.
    let pending: ReturnType<typeof setTimeout> | undefined;
    const read = () => {
      if (pending) return;
      pending = setTimeout(() => {
        pending = undefined;
        const next = readAnchors(el);
        setPts((prev) =>
          prev.length === next.length &&
          prev.every(
            (p, i) =>
              p.id === next[i]!.id && Math.abs(p.x - next[i]!.x) < 1 && Math.abs(p.y - next[i]!.y) < 1,
          )
            ? prev
            : next,
        );
        setSize((s) =>
          s.w === el.clientWidth && s.h === el.clientHeight ? s : { w: el.clientWidth, h: el.clientHeight },
        );
      }, 30);
    };
    read();
    // Animations settle over ~1 s; check again a few times.
    const timers = [150, 450, 900, 1600, 2600].map((ms) => setTimeout(read, ms));
    const ro = new ResizeObserver(read);
    ro.observe(el);
    const mo = new MutationObserver(read);
    mo.observe(el, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'transform', 'cx', 'cy'],
    });
    return () => {
      clearTimeout(pending);
      timers.forEach(clearTimeout);
      ro.disconnect();
      mo.disconnect();
    };
  }, [el, dep]);
  return { pts, ...size };
}

const LABEL_H = 34;
const CARD_W = 292;
/** Rough width of a name tag, for keeping tags apart. */
const TAG_W = 120;

/**
 * Callouts on the stage (like a labelled diagram): a pulsing dot on each part, an optional name tag with a
 * dashed leader line, and an inspector card with the part's note and, in the lab, its knobs.
 */
export function StageOverlay<A>({
  root,
  parts,
  dispatch,
  tinker,
  dep,
}: {
  /** The stage element the anchors and callouts are measured against. */
  root: HTMLElement;
  parts: ToyPart<A>[];
  dispatch: (a: A) => void;
  tinker: boolean;
  dep: unknown;
}) {
  const lang = useLang();
  const t = useT();
  const say = useSay();
  const { labels, goMode } = useWb();
  const { pts, w, h } = useAnchors(root, dep);
  const [open, setOpen] = useState<string | null>(null);
  const card = useRef<HTMLDivElement>(null);
  const [cardH, setCardH] = useState(240);
  // Measure the open card so it can be kept inside the stage.
  useLayoutEffect(() => {
    if (card.current) setCardH(card.current.offsetHeight);
  }, [open, lang, h]);
  const byId = new Map(parts.map((p) => [p.id, p]));
  const shown = pts.filter((p) => byId.has(p.id));
  const openPart = open ? byId.get(open) : undefined;
  const openPt = shown.find((p) => p.id === open);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(null);
    const onDown = (e: PointerEvent) => {
      const el = e.target as Element | null;
      if (!el?.closest('.kg-inspector, .kg-hot, .kg-tag')) setOpen(null);
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('pointerdown', onDown);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('pointerdown', onDown);
    };
  }, [open]);

  // Name tags sit above their dot (below if there is no room), nudged apart when two would overlap.
  const tags = new Map<string, { cx: number; top: number; above: boolean }>();
  for (const p of [...shown].sort((a, b) => a.x - b.x)) {
    const above = p.y > 90;
    const cx = Math.max(70, Math.min(w - 70, p.x + (p.x < w / 2 ? 28 : -28)));
    let top = above ? p.y - 58 - LABEL_H : p.y + 40;
    for (const o of tags.values())
      if (Math.abs(o.cx - cx) < TAG_W && Math.abs(o.top - top) < LABEL_H + 6)
        top = above ? o.top - LABEL_H - 8 : o.top + LABEL_H + 8;
    tags.set(p.id, { cx, top: Math.max(4, top), above });
  }
  const tagPos = (p: AnchorPoint) => tags.get(p.id)!;
  const toggle = (id: string) => setOpen((o) => (o === id ? null : id));

  return (
    <div className="kg-overlay">
      {labels && (
        <svg className="kg-overlay__lines" width={w} height={h} aria-hidden>
          {shown.map((p) => {
            const { top, above } = tagPos(p);
            return (
              <line
                key={p.id}
                x1={p.x}
                y1={p.y}
                x2={p.x}
                y2={above ? top + LABEL_H : top}
                strokeDasharray="4 4"
              />
            );
          })}
        </svg>
      )}
      {shown.map((p) => {
        const part = byId.get(p.id)!;
        const { cx, top } = tagPos(p);
        const name = pick(part.title, lang);
        return (
          <div key={p.id}>
            {labels && (
              <button
                type="button"
                className="kg-tag"
                data-tinker={tinker && !!part.knobs?.length}
                style={{ left: cx, top }}
                aria-expanded={open === p.id}
                onClick={() => toggle(p.id)}
              >
                <span aria-hidden>{part.icon}</span>
                {name}
              </button>
            )}
            <button
              type="button"
              className="kg-hot"
              style={{ left: p.x, top: p.y }}
              aria-label={name}
              aria-expanded={open === p.id}
              onClick={() => toggle(p.id)}
            />
          </div>
        );
      })}
      <AnimatePresence>
        {openPart && openPt && (
          <motion.div
            key={openPart.id}
            ref={card}
            className="kg-inspector"
            role="dialog"
            aria-label={pick(openPart.title, lang)}
            style={{
              // Beside the dot, on the roomier side, kept inside the stage.
              left: openPt.x + 28 + CARD_W < w ? openPt.x + 28 : Math.max(8, openPt.x - 28 - CARD_W),
              top: Math.max(8, Math.min(h - cardH - 8, openPt.y - cardH / 2)),
              maxHeight: h - 16,
            }}
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.94 }}
            transition={{ duration: 0.15 }}
          >
            <header>
              <span className="kg-inspector__icon" aria-hidden>
                {openPart.icon}
              </span>
              <strong>{pick(openPart.title, lang)}</strong>
              <IconButton label={t(S.listen)} onClick={() => say(openPart.note)}>
                🔊
              </IconButton>
              <IconButton label={t(S.close)} onClick={() => setOpen(null)}>
                ×
              </IconButton>
            </header>
            <p>{pick(openPart.note, lang)}</p>
            {openPart.knobs?.length ? (
              tinker ? (
                openPart.knobs.map((k) => <KnobControl key={k.id} knob={k} dispatch={dispatch} />)
              ) : (
                <div className="kg-inspector__locked">
                  <span>{t(S.knobsInLab)}</span>
                  <Button size="sm" onClick={() => goMode('lab')}>
                    🎛️ {t(S.goLab)}
                  </Button>
                </div>
              )
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
