import { Bag, Character, Item, KID_IDS, Plate, TableTop } from '@khelaghor/art';
import { formatNumber } from '@khelaghor/i18n';
import { DragSvg, Draggable, DropZone, useDropHover, type ToyViewProps } from '@khelaghor/stage';
import { motion, useReducedMotion } from 'motion/react';
import { perRow, plateOrder, plateSlot, pileSlot, slotCount, slotGrid } from './layout';
import { summarize, type Action, type State } from './model';

const W = 800;
const H = 470;
const TABLE_Y = 250;
const PILE = { x: 150, y: 352 };
const PLATES_X: [number, number] = [310, 785];

type Geo = { x: number; y: number; w: number };

function plateGeometry(n: number, maxPerRow: number): { geo: Geo[]; kids: boolean; step: number } {
  const g = slotGrid(n, maxPerRow);
  const span = PLATES_X[1] - PLATES_X[0];
  const step = span / g.cols;
  const w = Math.min(124, step - 12);
  const geo = Array.from({ length: n }, (_, k) => {
    const { col, row } = g.pos(k);
    const y = g.rows === 1 ? 362 : row === 0 ? 318 : 412;
    return { x: PLATES_X[0] + step * (col + 0.5), y, w };
  });
  return { geo, kids: g.rows === 1, step };
}

/** Wide items (chocolate, lemon) are drawn a bit smaller so the pile doesn't overlap. */
const WIDE: Partial<Record<State['config']['item'], number>> = { chocolate: 0.72, lemon: 0.86 };

function pilePos(s: State, i: number) {
  const p = pileSlot(i, s.total);
  const step = s.total > 20 ? 30 : 36;
  const k = WIDE[s.config.item] ?? 1;
  return { x: PILE.x + p.x * step, y: PILE.y + p.y * step * 0.62, scale: (s.total > 20 ? 0.72 : 0.82) * k };
}

function itemPos(s: State, i: number, order: number[], geo: Geo[]) {
  const w = s.where[i];
  if (w === null || w === undefined) return pilePos(s, i);
  const g = geo[w]!;
  const p = plateSlot(order[i]!);
  const unit = Math.min(30, g.w * 0.3);
  const isPack = s.config.mode === 'group';
  return {
    x: g.x + p.x * unit,
    y: g.y + (isPack ? -30 : -6) + p.y * unit * 0.55 - p.z * 9,
    scale: Math.min(0.66, g.w / 170) * (WIDE[s.config.item] ?? 1),
  };
}

/** Shows a highlight when an item is being carried over this plate/pack. */
function PlateHighlight({ id, children }: { id: string; children: (on: boolean) => React.ReactNode }) {
  return <>{children(useDropHover(id))}</>;
}

export function PlatesView2D({ state: s, dispatch, lang, readOnly }: ToyViewProps<State, Action>) {
  const reduce = useReducedMotion();
  const sum = summarize(s);
  const n = slotCount(s);
  const { geo, kids, step } = plateGeometry(n, perRow(s));
  const order = plateOrder(s.where);
  const share = s.config.mode === 'share';
  const kind = s.config.item;
  const wiggle = s.notice === 'not-enough' || s.notice === 'full';
  const leftover = sum.done && sum.remainder > 0;

  const onPlace = (itemId: string, zone: string) => {
    const item = Number(itemId.slice(1));
    dispatch({ type: 'place', item, to: zone === 'pile' ? 'pile' : Number(zone.slice(1)) });
  };

  // Kids: one behind each plate (share), or one per filled pack (group).
  const kidFor = (k: number) => KID_IDS[k % KID_IDS.length]!;
  const showKid = (k: number) => kids && (share || (sum.counts[k] ?? 0) === s.size);
  const kidPose = (k: number) => {
    if (sum.done) return 'cheer' as const;
    if (share && !sum.fair && (sum.counts[k] ?? 0) < Math.max(...sum.counts)) return 'sad' as const;
    return 'idle' as const;
  };
  const kidScale = Math.min(0.6, step / 175);

  return (
    <DragSvg viewBox={`0 0 ${W} ${H}`} onPlace={onPlace} label={`${s.total} ÷ ${share ? s.plates : s.size}`}>
      <defs>
        <linearGradient id="kg-wall" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#FFF4DD" />
          <stop offset="1" stopColor="#F7E2BC" />
        </linearGradient>
      </defs>
      <rect x={0} y={0} width={W} height={H} rx={20} fill="url(#kg-wall)" />
      <path
        d={`M0,${TABLE_Y - 30} Q${W / 2},${TABLE_Y - 50} ${W},${TABLE_Y - 30}`}
        stroke="#EBCB98"
        strokeWidth={3}
        fill="none"
      />

      {/* children stand behind the table */}
      {geo.map((g, k) =>
        showKid(k) ? (
          <motion.g
            key={`kid-${k}`}
            initial={share ? false : { x: 260, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 120, damping: 16 }}
          >
            <g
              transform={`translate(${g.x - 100 * kidScale}, ${TABLE_Y + 6 - 215 * kidScale}) scale(${kidScale})`}
            >
              <Character id={kidFor(k)} pose={kidPose(k)} expression={sum.done ? 'proud' : 'happy'} />
            </g>
          </motion.g>
        ) : null,
      )}

      <g transform={`translate(18, ${TABLE_Y})`}>
        <TableTop w={W - 36} h={H - TABLE_Y - 8} />
      </g>

      {/* the pile on a big plate */}
      <DropZone id="pile" x={PILE.x - 125} y={PILE.y - 75} w={250} h={150} disabled={readOnly}>
        <g transform={`translate(${PILE.x}, ${PILE.y + 18})`}>
          <Plate w={240} glow={leftover ? '#FF7A45' : undefined} />
        </g>
      </DropZone>
      {/* dashed ghosts where items used to be, as in the book */}
      {s.where.map((w, i) => {
        if (w === null) return null;
        const p = pilePos(s, i);
        return (
          <g key={`ghost-${i}`} transform={`translate(${p.x}, ${p.y}) scale(${p.scale})`}>
            <Item kind={kind} ghost />
          </g>
        );
      })}

      {/* plates or packs */}
      {geo.map((g, k) => {
        const exists = share || k < sum.slots;
        if (!exists) return null;
        const count = sum.counts[k] ?? 0;
        const isOpenPack = !share && k >= s.packs;
        return (
          <DropZone
            key={`plate-${k}`}
            id={`p${k}`}
            x={g.x - g.w / 2 - 6}
            y={g.y - (share ? 50 : 100)}
            w={g.w + 12}
            h={share ? 90 : 130}
            disabled={readOnly}
            onTap={() => dispatch({ type: 'giveOne', to: k })}
          >
            <PlateHighlight id={`p${k}`}>
              {(on) => (
                <g transform={`translate(${g.x}, ${g.y + (share ? 0 : 22)})`} opacity={isOpenPack ? 0.55 : 1}>
                  {share ? (
                    <Plate w={g.w} glow={on ? '#24A99A' : undefined} />
                  ) : (
                    <Bag w={g.w * 0.62} h={g.w * 0.6} glow={on ? '#24A99A' : undefined} />
                  )}
                </g>
              )}
            </PlateHighlight>
            {s.config.showCounts && exists && !isOpenPack && (
              <g transform={`translate(${g.x}, ${g.y + (share ? 40 : 44)})`}>
                <rect
                  x={-22}
                  y={-14}
                  width={44}
                  height={28}
                  rx={14}
                  fill="#fff"
                  stroke="#2B2B40"
                  strokeWidth={2}
                />
                <text
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={20}
                  fontWeight={700}
                  fill="#2B2B40"
                  fontFamily="var(--font)"
                >
                  {formatNumber(count, lang)}
                </text>
              </g>
            )}
          </DropZone>
        );
      })}

      {/* the items themselves: each keeps its identity, so it flies from the pile to its plate */}
      {s.where.map((_, i) => {
        const p = itemPos(s, i, order, geo);
        const inPile = s.where[i] === null;
        const k = order[i] ?? 0;
        return (
          <Draggable
            key={i}
            id={`i${i}`}
            x={p.x}
            y={p.y}
            disabled={readOnly}
            delay={inPile ? 0 : Math.min(k, 3) * 0.03 + (s.where[i]! % 6) * 0.05}
          >
            <motion.g
              key={inPile && (wiggle || leftover) ? `w${s.nonce}` : 'still'}
              animate={
                reduce
                  ? { scale: p.scale }
                  : inPile && wiggle
                    ? { scale: p.scale, rotate: [0, -14, 12, -8, 0] }
                    : inPile && leftover
                      ? { scale: [p.scale, p.scale * 1.15, p.scale] }
                      : { scale: p.scale, rotate: 0 }
              }
              transition={
                inPile && leftover && !wiggle ? { duration: 1.2, repeat: Infinity } : { duration: 0.45 }
              }
            >
              {inPile && leftover && <circle r={24} fill="#FFB86B" opacity={0.45} />}
              <Item kind={kind} />
            </motion.g>
          </Draggable>
        );
      })}
    </DragSvg>
  );
}
