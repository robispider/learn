import { useEffect, useState } from 'react';
import type { ViewMode } from './toy';

export type Capability = {
  webgl: boolean;
  webgl2: boolean;
  /** GB, when the browser reports it. */
  memory?: number;
  cores?: number;
  /** Median frame time over a short sample, in ms. */
  frameMs?: number;
  /** Richest view this device should get by default. */
  best: ViewMode;
  reason: string;
};

function sampleFrames(n = 24): Promise<number> {
  return new Promise((resolve) => {
    if (typeof requestAnimationFrame === 'undefined') return resolve(16.7);
    const times: number[] = [];
    let last = performance.now();
    const tick = (t: number) => {
      times.push(t - last);
      last = t;
      if (times.length < n) requestAnimationFrame(tick);
      else {
        times.sort((a, b) => a - b);
        resolve(times[Math.floor(times.length / 2)]!);
      }
    };
    requestAnimationFrame(tick);
    // Hidden tabs never fire rAF; don't wait forever.
    setTimeout(() => resolve(times.length ? times[Math.floor(times.length / 2)]! : 16.7), 1500);
  });
}

/** WebGL support, memory and frame time decide whether 2.5-D/3-D is on by default. */
export async function detectCapability(): Promise<Capability> {
  let webgl = false;
  let webgl2 = false;
  try {
    const c = document.createElement('canvas');
    webgl2 = !!c.getContext('webgl2');
    webgl = webgl2 || !!c.getContext('webgl');
  } catch {
    /* no WebGL */
  }
  const nav = navigator as Navigator & { deviceMemory?: number };
  const memory = nav.deviceMemory;
  const cores = nav.hardwareConcurrency;
  const frameMs = await sampleFrames();
  if (!webgl) return { webgl, webgl2, memory, cores, frameMs, best: '2d', reason: 'no-webgl' };
  if (memory !== undefined && memory < 2)
    return { webgl, webgl2, memory, cores, frameMs, best: '2d', reason: 'low-memory' };
  if (frameMs > 34) return { webgl, webgl2, memory, cores, frameMs, best: '2d', reason: 'slow-frames' };
  const strong = webgl2 && (memory ?? 4) >= 4 && (cores ?? 4) >= 4 && frameMs < 20;
  return {
    webgl,
    webgl2,
    memory,
    cores,
    frameMs,
    best: strong ? '3d' : '2.5d',
    reason: strong ? 'capable' : 'mid',
  };
}

let cached: Promise<Capability> | null = null;
export function getCapability(): Promise<Capability> {
  cached ??= detectCapability();
  return cached;
}

export function useCapability(): Capability | null {
  const [cap, setCap] = useState<Capability | null>(null);
  useEffect(() => {
    let live = true;
    void getCapability().then((c) => live && setCap(c));
    return () => {
      live = false;
    };
  }, []);
  return cap;
}

const RANK: Record<ViewMode, number> = { '2d': 0, '2.5d': 1, '3d': 2 };

/** Pick the view to show: the user's choice if allowed, else the richest one the toy and device both support. */
export function chooseView(
  toyViews: ViewMode[],
  cap: Capability | null,
  preference: 'auto' | ViewMode,
): ViewMode {
  const max = cap ? RANK[cap.best] : 0;
  const allowed = toyViews.filter((v) => RANK[v] <= max || v === '2d');
  if (preference !== 'auto') return allowed.includes(preference) ? preference : '2d';
  return allowed.reduce<ViewMode>((best, v) => (RANK[v] > RANK[best] ? v : best), '2d');
}

/**
 * The view a lesson scene asked for (one view per scene, chosen for the learning need), if the toy has
 * it and the device can run it; otherwise 2-D. A '2d' preference (lite mode in settings) forces 2-D.
 */
export function lessonView(
  toyViews: ViewMode[],
  cap: Capability | null,
  wanted: ViewMode = '2d',
  preference: 'auto' | ViewMode = 'auto',
): ViewMode {
  if (preference === '2d' || wanted === '2d' || !toyViews.includes(wanted)) return '2d';
  const max = cap ? RANK[cap.best] : 0;
  return RANK[wanted] <= max ? wanted : '2d';
}
