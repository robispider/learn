/**
 * Isometric projection for light 2.5-D scenes drawn in SVG.
 * World x runs right-down, y runs left-down, z is up. One world unit = `unit` px.
 */
export function iso(x: number, y: number, z = 0, unit = 40): [number, number] {
  const c = Math.cos(Math.PI / 6);
  return [(x - y) * c * unit, ((x + y) * 0.5 - z) * unit];
}

/** Painter's-order key for iso shapes: draw larger keys later. */
export function isoDepth(x: number, y: number, z = 0): number {
  return x + y + z * 0.01;
}
