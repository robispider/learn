/**
 * Where a toy part is on screen. Renderers drop an anchor at a part's spot; the stage overlay finds
 * every `[data-kg-anchor]` element and draws its callout there, whatever the view (SVG or WebGL).
 */
export function SvgAnchor({ id, x, y }: { id: string; x: number; y: number }) {
  return <circle data-kg-anchor={id} cx={x} cy={y} r={0.5} fill="none" pointerEvents="none" />;
}

export type AnchorPoint = { id: string; x: number; y: number };

/** Anchor centres relative to `root`, in CSS pixels. */
export function readAnchors(root: HTMLElement): AnchorPoint[] {
  const box = root.getBoundingClientRect();
  const out: AnchorPoint[] = [];
  root.querySelectorAll<Element>('[data-kg-anchor]').forEach((el) => {
    const r = el.getBoundingClientRect();
    const x = r.left + r.width / 2 - box.left;
    const y = r.top + r.height / 2 - box.top;
    if (x < 0 || y < 0 || x > box.width || y > box.height) return;
    out.push({ id: el.getAttribute('data-kg-anchor')!, x, y });
  });
  return out;
}
