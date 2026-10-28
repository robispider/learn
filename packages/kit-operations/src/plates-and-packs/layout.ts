import { maxPacks, type State } from './model';

/**
 * Layout in abstract units shared by the 2-D and 2.5-D views. Each view scales these to its own space.
 * Pile: a heap of rows, centre at (0,0), one unit per item. Plates: a row (or two) of slots.
 */
export function pileSlot(i: number, n: number): { x: number; y: number } {
  const cols = n <= 6 ? 3 : n <= 12 ? 4 : n <= 20 ? 5 : 6;
  const rows = Math.ceil(n / cols);
  const row = Math.floor(i / cols);
  const col = i % cols;
  const inRow = Math.min(cols, n - row * cols);
  return {
    x: col - (inRow - 1) / 2 + (row % 2 ? 0.25 : 0),
    y: row - (rows - 1) / 2,
  };
}

/** Position of the k-th item on a plate, in units (stacked a little upward). */
export function plateSlot(k: number): { x: number; y: number; z: number } {
  const layer = Math.floor(k / 6);
  const j = k % 6;
  const ring: [number, number][] = [
    [-0.55, 0.2],
    [0, 0.25],
    [0.55, 0.2],
    [-0.3, -0.25],
    [0.3, -0.25],
    [0, -0.05],
  ];
  const [x, y] = ring[j]!;
  return { x: x + (layer % 2 ? 0.12 : 0), y, z: layer };
}

/** Number of plate/pack positions to lay out (fixed for a state, so things don't jump around). */
export function slotCount(s: State): number {
  return s.config.mode === 'share' ? s.plates : maxPacks(s);
}

/** Packs are narrower than plates, so group mode fits more in one row. */
export function perRow(s: State): number {
  return s.config.mode === 'share' ? 6 : 8;
}

export function slotGrid(
  n: number,
  maxPerRow = 6,
): { cols: number; rows: number; pos: (k: number) => { col: number; row: number } } {
  const rows = n <= maxPerRow ? 1 : 2;
  const cols = Math.ceil(n / rows);
  return { cols, rows, pos: (k) => ({ col: k % cols, row: Math.floor(k / cols) }) };
}

/** For each item, its index among items on the same plate (to pick a plate slot). */
export function plateOrder(where: (number | null)[]): number[] {
  const seen = new Map<number, number>();
  return where.map((w) => {
    if (w === null) return -1;
    const k = seen.get(w) ?? 0;
    seen.set(w, k + 1);
    return k;
  });
}
