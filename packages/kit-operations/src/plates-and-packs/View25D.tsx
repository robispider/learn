/**
 * 2.5-D table scene for T5 (react-three-fiber, orthographic camera). Lazy-loaded: this file and three.js
 * form their own chunk. Same state, actions and tap-to-place model as the 2-D view.
 */
import { Bag3D, Item3D, Kid3D, Plate3D, Table3D } from '@khelaghor/art/three';
import { KID_IDS, LOOKS } from '@khelaghor/art';
import { PickPlaceProvider, usePickPlace, type ToyViewProps } from '@khelaghor/stage';
import { BlobShadow, Mover, ThreeStage } from '@khelaghor/stage/three';
import type { ThreeEvent } from '@react-three/fiber';
import { perRow, plateOrder, plateSlot, pileSlot, slotCount, slotGrid } from './layout';
import { summarize, type Action, type State } from './model';

const PILE: [number, number] = [-3.5, 0.7];
const REGION: [number, number] = [-1.5, 4.7];

function plateSpots(n: number, maxPerRow: number) {
  const g = slotGrid(n, maxPerRow);
  const step = (REGION[1] - REGION[0]) / g.cols;
  const scale = Math.min(1, step / 1.15);
  return {
    kids: g.rows === 1,
    scale,
    spots: Array.from({ length: n }, (_, k) => {
      const { col, row } = g.pos(k);
      return { x: REGION[0] + step * (col + 0.5), z: g.rows === 1 ? 0.8 : row === 0 ? 0.1 : 1.6 };
    }),
  };
}

function Scene({ state: s, dispatch, readOnly }: ToyViewProps<State, Action>) {
  const pp = usePickPlace();
  const sum = summarize(s);
  const share = s.config.mode === 'share';
  const n = slotCount(s);
  const { spots, scale, kids } = plateSpots(n, perRow(s));
  const order = plateOrder(s.where);
  const tap = (fn: () => void) => (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (!readOnly) fn();
  };

  const itemTo = (i: number): [number, number, number] => {
    const w = s.where[i];
    if (w === null || w === undefined) {
      const p = pileSlot(i, s.total);
      const lift = pp.selected === `i${i}` ? 0.35 : 0;
      return [PILE[0] + p.x * 0.4, 0.08 + lift, PILE[1] + p.y * 0.36];
    }
    const spot = spots[w]!;
    const p = plateSlot(order[i]!);
    const front = share ? 0 : 0.42;
    const layerH = s.config.item === 'biscuit' ? 0.07 : 0.22;
    return [spot.x + p.x * 0.42 * scale, 0.08 + p.z * layerH, spot.z + front + p.y * 0.5 * scale];
  };

  return (
    <>
      <Table3D w={10.6} d={3.6} position={[0, 0, 0.9]} />
      {/* pile plate */}
      <group position={[PILE[0], 0, PILE[1]]} onClick={tap(() => pp.placeOn('pile'))}>
        <Plate3D scale={[2.3, 1, 1.9]} highlight={sum.done && sum.remainder > 0 ? '#FFD8B0' : undefined} />
      </group>
      {spots.map((spot, k) => {
        const exists = share || k < sum.slots;
        if (!exists) return null;
        const filled = (sum.counts[k] ?? 0) === s.size;
        const onPlate = tap(() => (pp.selected ? pp.placeOn(`p${k}`) : dispatch({ type: 'giveOne', to: k })));
        return (
          <group key={k}>
            {kids && (share || filled) && (
              <Mover
                to={[spot.x, 0, -0.75]}
                from={share ? undefined : [spot.x + 6, 0, -0.75]}
                hop={0}
                speed={1.2}
              >
                <Kid3D look={LOOKS[KID_IDS[k % KID_IDS.length]!]!} scale={1.25 * Math.min(1, scale + 0.15)} />
              </Mover>
            )}
            <group position={[spot.x, 0, spot.z]} onClick={onPlate}>
              {share ? (
                <Plate3D scale={scale} highlight={pp.selected ? '#E2FFF8' : undefined} />
              ) : (
                <Bag3D scale={scale * 0.9} highlight={k >= s.packs ? '#F3E3CC' : undefined} />
              )}
            </group>
          </group>
        );
      })}
      {s.where.map((w, i) => (
        <Mover key={i} to={itemTo(i)} delay={w === null ? 0 : (w % 6) * 0.06}>
          <group onClick={tap(() => pp.pick(`i${i}`))}>
            <BlobShadow r={0.14} />
            <Item3D kind={s.config.item} />
          </group>
        </Mover>
      ))}
    </>
  );
}

export default function PlatesView25D(props: ToyViewProps<State, Action>) {
  const onPlace = (itemId: string, zone: string) =>
    props.dispatch({
      type: 'place',
      item: Number(itemId.slice(1)),
      to: zone === 'pile' ? 'pile' : Number(zone.slice(1)),
    });
  return (
    <div className="kg-scene-25d">
      <ThreeStage width={10.8} minHeight={5.2} camera={[0, 6, 8]} label={`${props.state.total}`}>
        <PickPlaceProvider onPlace={onPlace}>
          <Scene {...props} />
        </PickPlaceProvider>
      </ThreeStage>
    </div>
  );
}
