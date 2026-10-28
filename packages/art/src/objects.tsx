import { FOOD, INK, OUTLINE, PLATE, WOOD } from './palette';

/** Countable things a toy can share out. Each is drawn centred at (0,0), about 40 units across. */
export type ItemKind = 'biscuit' | 'orange' | 'lemon' | 'chocolate';
export const ITEM_KINDS: ItemKind[] = ['biscuit', 'orange', 'lemon', 'chocolate'];

export function Biscuit() {
  const c = FOOD.biscuit;
  return (
    <g>
      <circle r={19} fill={c.shade} stroke={INK} strokeWidth={OUTLINE} />
      <circle r={15.5} cy={-1.5} fill={c.base} />
      <path d="M-10,-10 Q-4,-15 4,-14" stroke={c.hi} strokeWidth={3} fill="none" strokeLinecap="round" />
      {[
        [-6, -4],
        [5, -6],
        [-2, 4],
        [8, 3],
        [-8, 6],
      ].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={1.6} fill={c.shade} />
      ))}
    </g>
  );
}

export function Orange() {
  const c = FOOD.orange;
  return (
    <g>
      <circle r={19} fill={c.base} stroke={INK} strokeWidth={OUTLINE} />
      <path
        d="M-13,10 Q0,20 13,10"
        stroke={c.shade}
        strokeWidth={4}
        fill="none"
        strokeLinecap="round"
        opacity={0.6}
      />
      <ellipse cx={-7} cy={-7} rx={5} ry={3.5} fill={c.hi} transform="rotate(-30 -7 -7)" />
      <path
        d="M1,-18 Q12,-28 20,-20 Q10,-14 1,-18 Z"
        fill={FOOD.leaf.base}
        stroke={INK}
        strokeWidth={1.6}
        strokeLinejoin="round"
      />
      <circle cx={0} cy={-17} r={2} fill={FOOD.leaf.shade} />
    </g>
  );
}

export function Lemon() {
  const c = FOOD.lemon;
  return (
    <g>
      <path
        d="M-22,0 Q-20,-16 0,-17 Q20,-16 22,0 Q20,16 0,17 Q-20,16 -22,0 Z"
        fill={c.base}
        stroke={INK}
        strokeWidth={OUTLINE}
        strokeLinejoin="round"
      />
      <path d="M-25,0 L-21,-2 L-21,2 Z M25,0 L21,-2 L21,2 Z" fill={c.shade} stroke={INK} strokeWidth={1.4} />
      <ellipse cx={-6} cy={-8} rx={7} ry={3} fill={c.hi} />
      <path
        d="M-4,-16 Q4,-28 14,-22 Q6,-16 -4,-16 Z"
        fill={FOOD.leaf.base}
        stroke={INK}
        strokeWidth={1.6}
        strokeLinejoin="round"
      />
    </g>
  );
}

export function Chocolate() {
  const c = FOOD.chocolate;
  return (
    <g>
      <path
        d="M-22,-6 L-28,-12 L-28,12 L-22,6 Z M22,-6 L28,-12 L28,12 L22,6 Z"
        fill="#E85D75"
        stroke={INK}
        strokeWidth={1.6}
        strokeLinejoin="round"
      />
      <rect x={-22} y={-12} width={44} height={24} rx={6} fill={c.base} stroke={INK} strokeWidth={OUTLINE} />
      <rect x={-22} y={-4} width={44} height={8} fill="#E85D75" />
      <path d="M-16,-8 L-4,-8" stroke={c.hi} strokeWidth={2.5} strokeLinecap="round" />
    </g>
  );
}

const ITEMS: Record<ItemKind, () => React.JSX.Element> = {
  biscuit: Biscuit,
  orange: Orange,
  lemon: Lemon,
  chocolate: Chocolate,
};

/** Draw any item. `ghost` draws the dashed outline the book uses for items that have left the pile. */
export function Item({ kind, ghost }: { kind: ItemKind; ghost?: boolean }) {
  if (ghost) {
    return kind === 'lemon' || kind === 'chocolate' ? (
      <rect
        x={-21}
        y={-14}
        width={42}
        height={28}
        rx={12}
        fill="none"
        stroke={INK}
        strokeWidth={1.8}
        strokeDasharray="4 4"
        opacity={0.55}
      />
    ) : (
      <circle r={18} fill="none" stroke={INK} strokeWidth={1.8} strokeDasharray="4 4" opacity={0.55} />
    );
  }
  const C = ITEMS[kind];
  return <C />;
}

/** A plate seen at a slight angle, centred at (0,0). */
export function Plate({ w = 120, glow }: { w?: number; glow?: string }) {
  const h = w * 0.38;
  return (
    <g>
      <ellipse rx={w / 2 + 4} ry={h / 2 + 4} cy={5} fill="rgba(43,43,64,0.18)" />
      {glow && (
        <ellipse rx={w / 2 + 8} ry={h / 2 + 8} fill="none" stroke={glow} strokeWidth={5} opacity={0.8} />
      )}
      <ellipse rx={w / 2} ry={h / 2} fill={PLATE.base} stroke={INK} strokeWidth={OUTLINE} />
      <ellipse rx={w / 2 - 12} ry={h / 2 - 6} cy={2} fill={PLATE.rim} />
      <ellipse rx={w / 2 - 16} ry={h / 2 - 9} cy={3} fill={PLATE.base} />
    </g>
  );
}

/** A paper bag (one pack), centred at its base (0,0). */
export function Bag({ w = 74, h = 70, glow }: { w?: number; h?: number; glow?: string }) {
  return (
    <g>
      <ellipse rx={w / 2 + 4} ry={8} fill="rgba(43,43,64,0.18)" />
      {glow && (
        <rect
          x={-w / 2 - 6}
          y={-h - 6}
          width={w + 12}
          height={h + 12}
          rx={14}
          fill="none"
          stroke={glow}
          strokeWidth={5}
          opacity={0.8}
        />
      )}
      <path
        d={`M${-w / 2},0 L${-w / 2 + 4},${-h} L${w / 2 - 4},${-h} L${w / 2},0 Z`}
        fill="#E2B77E"
        stroke={INK}
        strokeWidth={OUTLINE}
        strokeLinejoin="round"
      />
      <path
        d={`M${-w / 2 + 4},${-h} L${-w / 2 + 12},${-h - 10} L${w / 2 - 12},${-h - 10} L${w / 2 - 4},${-h} Z`}
        fill="#C99A5E"
        stroke={INK}
        strokeWidth={OUTLINE}
        strokeLinejoin="round"
      />
      <path
        d={`M${-w / 4},${-h + 10} L${-w / 4},${-6} M${w / 4},${-h + 10} L${w / 4},${-6}`}
        stroke="#C99A5E"
        strokeWidth={2}
      />
    </g>
  );
}

/** A wooden table top seen from the front-top, `w` × `h`, top-left at (0,0). */
export function TableTop({ w, h }: { w: number; h: number }) {
  return (
    <g>
      <rect x={0} y={0} width={w} height={h} rx={22} fill={WOOD.top} stroke={INK} strokeWidth={OUTLINE} />
      <rect
        x={0}
        y={h - 20}
        width={w}
        height={20}
        rx={10}
        fill={WOOD.edge}
        stroke={INK}
        strokeWidth={OUTLINE}
      />
      {[0.22, 0.48, 0.74].map((f) => (
        <path
          key={f}
          d={`M${w * 0.06},${h * f} Q${w * 0.5},${h * f + 8} ${w * 0.94},${h * f}`}
          stroke={WOOD.grain}
          strokeWidth={3}
          fill="none"
          opacity={0.7}
        />
      ))}
    </g>
  );
}

/** A ribbon `length` units long with tick marks every `step` units (for cutting pieces). */
export function Ribbon({ length, color = '#E85D75' }: { length: number; color?: string }) {
  return (
    <g>
      <rect x={0} y={-10} width={length} height={20} rx={4} fill={color} stroke={INK} strokeWidth={OUTLINE} />
      <path d={`M4,-4 L${length - 4},-4`} stroke="#fff" strokeWidth={2} opacity={0.5} />
    </g>
  );
}
