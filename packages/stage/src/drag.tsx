import { motion, useReducedMotion } from 'motion/react';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as RPointerEvent,
  type ReactNode,
  type RefObject,
} from 'react';

/**
 * One input model for every toy: drag an item onto a drop zone, or tap the item and then tap the zone.
 * 2-D renderers use <DragSvg>/<Draggable>/<DropZone>; 3-D renderers call the same `pick`/`placeOn`.
 */
type Rect = { x: number; y: number; w: number; h: number };

type DragCtx = {
  svg: RefObject<SVGSVGElement | null>;
  zones: Map<string, Rect>;
  selected: string | null;
  setSelected: (id: string | null) => void;
  hover: string | null;
  setHover: (id: string | null) => void;
  place: (itemId: string, zoneId: string) => void;
};

const Ctx = createContext<DragCtx | null>(null);

export type PickPlace = {
  selected: string | null;
  pick: (itemId: string | null) => void;
  placeOn: (zoneId: string) => void;
  hover: string | null;
};

export function usePickPlace(): PickPlace {
  const c = useContext(Ctx);
  if (!c) throw new Error('usePickPlace must be inside <PickPlaceProvider> or <DragSvg>');
  return {
    selected: c.selected,
    hover: c.hover,
    pick: (id) => c.setSelected(c.selected === id ? null : id),
    placeOn: (zoneId) => {
      if (c.selected) {
        c.place(c.selected, zoneId);
        c.setSelected(null);
      }
    },
  };
}

/** Shares pick/place state without an SVG (used by 3-D renderers). */
export function PickPlaceProvider({
  onPlace,
  children,
  svgRef,
}: {
  onPlace: (itemId: string, zoneId: string) => void;
  children: ReactNode;
  svgRef?: RefObject<SVGSVGElement | null>;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const [hover, setHover] = useState<string | null>(null);
  const zones = useRef(new Map<string, Rect>()).current;
  const fallbackRef = useRef<SVGSVGElement | null>(null);
  const placeRef = useRef(onPlace);
  useEffect(() => {
    placeRef.current = onPlace;
  });
  const place = useCallback((i: string, z: string) => placeRef.current(i, z), []);
  const value = useMemo(
    () => ({ svg: svgRef ?? fallbackRef, zones, selected, setSelected, hover, setHover, place }),
    [svgRef, zones, selected, hover, place],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

/** An <svg> stage layer with drag-and-drop and tap-to-place built in. */
export function DragSvg({
  viewBox,
  onPlace,
  children,
  className,
  label,
}: {
  viewBox: string;
  onPlace: (itemId: string, zoneId: string) => void;
  children: ReactNode;
  className?: string;
  label?: string;
}) {
  const ref = useRef<SVGSVGElement>(null);
  return (
    <PickPlaceProvider onPlace={onPlace} svgRef={ref}>
      <svg
        ref={ref}
        viewBox={viewBox}
        className={className}
        role="img"
        aria-label={label}
        style={{ width: '100%', height: '100%', touchAction: 'none', userSelect: 'none', display: 'block' }}
      >
        {children}
      </svg>
    </PickPlaceProvider>
  );
}

function toSvgPoint(svg: SVGSVGElement, clientX: number, clientY: number) {
  const m = svg.getScreenCTM();
  if (!m) return { x: 0, y: 0 };
  const p = new DOMPoint(clientX, clientY).matrixTransform(m.inverse());
  return { x: p.x, y: p.y };
}

function zoneAt(zones: Map<string, Rect>, x: number, y: number): string | null {
  for (const [id, r] of zones) if (x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h) return id;
  return null;
}

/** A drop target. Tapping it places the selected item. */
export function DropZone({
  id,
  x,
  y,
  w,
  h,
  children,
  disabled,
  onTap,
}: Rect & {
  id: string;
  children?: ReactNode;
  disabled?: boolean;
  /** Tapped with nothing picked up. */ onTap?: () => void;
}) {
  const c = useContext(Ctx)!;
  useEffect(() => {
    if (disabled) return;
    c.zones.set(id, { x, y, w, h });
    return () => {
      c.zones.delete(id);
    };
  }, [c.zones, id, x, y, w, h, disabled]);
  const onClick = () => {
    if (disabled) return;
    if (c.selected) {
      c.place(c.selected, id);
      c.setSelected(null);
    } else onTap?.();
  };
  return (
    <g
      onClick={onClick}
      style={{ cursor: !disabled && (c.selected || onTap) ? 'pointer' : undefined }}
      data-zone={id}
    >
      <rect x={x} y={y} width={w} height={h} fill="transparent" />
      {children}
    </g>
  );
}

export function useDropHover(id: string): boolean {
  const c = useContext(Ctx);
  return !!c && (c.hover === id || (!!c.selected && c.zones.has(id)));
}

/**
 * An item that springs to (x, y) whenever its place changes, and can be dragged or tapped.
 * `from` is where it first appears (e.g. the pile), so new items fly in.
 */
export function Draggable({
  id,
  x,
  y,
  from,
  disabled,
  children,
  delay = 0,
}: {
  id: string;
  x: number;
  y: number;
  from?: { x: number; y: number };
  disabled?: boolean;
  children: ReactNode;
  delay?: number;
}) {
  const c = useContext(Ctx)!;
  const reduce = useReducedMotion();
  const [drag, setDrag] = useState<{ dx: number; dy: number } | null>(null);
  const start = useRef<{ x: number; y: number; moved: boolean } | null>(null);
  const selected = c.selected === id;

  const onDown = (e: RPointerEvent<SVGGElement>) => {
    if (disabled || !c.svg.current) return;
    e.stopPropagation();
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
    const p = toSvgPoint(c.svg.current, e.clientX, e.clientY);
    start.current = { ...p, moved: false };
  };
  const onMove = (e: RPointerEvent<SVGGElement>) => {
    if (!start.current || !c.svg.current) return;
    const p = toSvgPoint(c.svg.current, e.clientX, e.clientY);
    const dx = p.x - start.current.x;
    const dy = p.y - start.current.y;
    if (!start.current.moved && Math.hypot(dx, dy) < 8) return;
    start.current.moved = true;
    setDrag({ dx, dy });
    c.setHover(zoneAt(c.zones, p.x, p.y));
  };
  const onUp = (e: RPointerEvent<SVGGElement>) => {
    const s = start.current;
    start.current = null;
    if (!s || !c.svg.current) return;
    if (!s.moved) {
      c.setSelected(selected ? null : id);
    } else {
      const p = toSvgPoint(c.svg.current, e.clientX, e.clientY);
      const zone = zoneAt(c.zones, p.x, p.y);
      if (zone) c.place(id, zone);
      c.setSelected(null);
    }
    c.setHover(null);
    setDrag(null);
  };

  const tx = x + (drag?.dx ?? 0);
  const ty = y + (drag?.dy ?? 0);
  return (
    <motion.g
      initial={from ? { x: from.x, y: from.y } : false}
      animate={{ x: tx, y: ty, scale: drag ? 1.15 : selected ? 1.12 : 1 }}
      transition={drag || reduce ? { duration: 0 } : { type: 'spring', stiffness: 260, damping: 22, delay }}
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
      style={{ cursor: disabled ? 'default' : drag ? 'grabbing' : 'grab' }}
      data-item={id}
    >
      {selected && <circle r={26} fill="none" stroke="#FF7A45" strokeWidth={4} strokeDasharray="6 4" />}
      {children}
    </motion.g>
  );
}
