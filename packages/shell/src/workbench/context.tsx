import { createContext, useContext, useEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

/** `code` is the ▶ চালাও tab of the side panel: the live "math language" of the stage's toy. */
export type SlotName = 'stage' | 'panel' | 'code';

type Wb = {
  slots: Partial<Record<SlotName, HTMLElement | null>>;
  /** The current mode's hint action, shown as 💡 on the stage toolbar. */
  hint: (() => void) | null;
  setHint: (fn: (() => void) | null) => void;
  /** Callout labels on the stage. */
  labels: boolean;
  setLabels: (on: boolean) => void;
  /** Switch the lesson tab (e.g. a callout's "change it in the lab"). */
  goMode: (mode: string) => void;
  /** This lesson has a 🎛️ lab tab to send knob changes to. */
  canLab: boolean;
  /** The ▶ চালাও tab is showing instead of the mode's panel. */
  run: boolean;
  setRun: (on: boolean) => void;
  /** The stage's toy has math lines to show, so the ▶ চালাও tab is offered. */
  setHasCode: (on: boolean) => void;
};

export const WbCtx = createContext<Wb | null>(null);

export function useWb(): Wb {
  const w = useContext(WbCtx);
  if (!w) throw new Error('useWb outside the lesson workbench');
  return w;
}

/** Renders into one of the workbench areas (stage or side panel), wherever it sits in the tree. */
export function Slot({ name, children }: { name: SlotName; children: ReactNode }) {
  const el = useWb().slots[name];
  return el ? createPortal(children, el) : null;
}

/** Offer a 💡 on the stage toolbar while `onHint` is given. */
export function useHintButton(onHint: (() => void) | null) {
  const { setHint } = useWb();
  const ref = useRef(onHint);
  ref.current = onHint;
  const on = !!onHint;
  useEffect(() => {
    if (!on) return;
    setHint(() => ref.current?.());
    return () => setHint(null);
  }, [on, setHint]);
}
