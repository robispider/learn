import { createContext, useContext, useEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

export type SlotName = 'stage' | 'panel';

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
