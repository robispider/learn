/**
 * Sound effects synthesised with Web Audio, so there are no files to download.
 * Call `unlockAudio()` from the first tap (mobile browsers start audio suspended).
 */
export type Sfx = 'pop' | 'snap' | 'whoosh' | 'success' | 'oops' | 'cheer' | 'tick' | 'tap';

let ctx: AudioContext | null = null;
let enabled = true;

function audio(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const AC =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  ctx ??= new AC();
  return ctx;
}

export function unlockAudio() {
  const a = audio();
  if (a?.state === 'suspended') void a.resume();
}

export function setSfxEnabled(on: boolean) {
  enabled = on;
}

function tone(
  a: AudioContext,
  freq: number,
  start: number,
  dur: number,
  type: OscillatorType = 'sine',
  gain = 0.18,
  slideTo?: number,
) {
  const osc = a.createOscillator();
  const g = a.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, start + dur);
  g.gain.setValueAtTime(0.0001, start);
  g.gain.exponentialRampToValueAtTime(gain, start + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
  osc.connect(g).connect(a.destination);
  osc.start(start);
  osc.stop(start + dur + 0.02);
}

function noise(a: AudioContext, start: number, dur: number, gain = 0.08) {
  const buffer = a.createBuffer(1, Math.floor(a.sampleRate * dur), a.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
  const src = a.createBufferSource();
  const filter = a.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(800, start);
  filter.frequency.exponentialRampToValueAtTime(3000, start + dur);
  const g = a.createGain();
  g.gain.value = gain;
  src.buffer = buffer;
  src.connect(filter).connect(g).connect(a.destination);
  src.start(start);
}

export function playSfx(name: Sfx) {
  if (!enabled) return;
  const a = audio();
  if (!a || a.state !== 'running') return;
  const t = a.currentTime;
  switch (name) {
    case 'tap':
      tone(a, 660, t, 0.05, 'triangle', 0.08);
      break;
    case 'tick':
      tone(a, 1200, t, 0.03, 'square', 0.04);
      break;
    case 'pop':
      tone(a, 420, t, 0.12, 'sine', 0.2, 900);
      break;
    case 'snap':
      tone(a, 880, t, 0.06, 'triangle', 0.15);
      tone(a, 1320, t + 0.04, 0.08, 'triangle', 0.1);
      break;
    case 'whoosh':
      noise(a, t, 0.25);
      break;
    case 'success':
      [523, 659, 784].forEach((f, i) => tone(a, f, t + i * 0.09, 0.18, 'triangle', 0.16));
      break;
    case 'cheer':
      [523, 659, 784, 1047].forEach((f, i) => tone(a, f, t + i * 0.08, 0.25, 'triangle', 0.16));
      noise(a, t + 0.3, 0.3, 0.04);
      break;
    case 'oops':
      tone(a, 330, t, 0.16, 'sine', 0.14, 247);
      break;
  }
}
