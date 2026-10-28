import { toSpeech, type Lang } from '@khelaghor/i18n';
import { useSyncExternalStore } from 'react';

export type SpeakRequest = {
  /** Stable string key; looked up in recorded / pre-generated voice manifests. */
  key?: string;
  /** Display text; converted to speakable words when a TTS source reads it. */
  text: string;
  lang: Lang;
  rate?: 'slow' | 'normal';
  /** Which character is talking, so their mouth can move. */
  speaker?: string;
};

export type SpeakingState = {
  speaker?: string;
  text?: string;
  /** True when no voice is available and we only highlight the text. */
  silent: boolean;
} | null;

/** One way of producing a voice. Sources are tried in order; the first that `can` speak wins. */
export interface VoiceSource {
  name: string;
  can(req: SpeakRequest): boolean;
  speak(req: SpeakRequest, signal: AbortSignal): Promise<void>;
  stop(): void;
}

/** Voice files listed in a manifest: `{ "bn/ch06.6-1.hook.0": "/voice/bn/....mp3" }`. Used for recorded and pre-generated voice. */
export function fileSource(name: string, manifest: Record<string, string>): VoiceSource {
  let audio: HTMLAudioElement | null = null;
  const url = (req: SpeakRequest) => (req.key ? manifest[`${req.lang}/${req.key}`] : undefined);
  return {
    name,
    can: (req) => !!url(req) && typeof Audio !== 'undefined',
    speak: (req, signal) =>
      new Promise<void>((resolve) => {
        audio = new Audio(url(req));
        audio.playbackRate = req.rate === 'slow' ? 0.85 : 1;
        audio.onended = audio.onerror = () => resolve();
        signal.addEventListener('abort', () => {
          audio?.pause();
          resolve();
        });
        audio.play().catch(() => resolve());
      }),
    stop: () => audio?.pause(),
  };
}

function findDeviceVoice(lang: Lang): SpeechSynthesisVoice | undefined {
  if (typeof speechSynthesis === 'undefined') return undefined;
  const voices = speechSynthesis.getVoices();
  const prefs = lang === 'bn' ? ['bn-BD', 'bn-IN', 'bn'] : ['en-IN', 'en-GB', 'en-US', 'en'];
  for (const p of prefs) {
    const v = voices.find((v) => v.lang.replace('_', '-').toLowerCase().startsWith(p.toLowerCase()));
    if (v) return v;
  }
  return undefined;
}

/** The device's own text-to-speech (Web Speech API). Only used when a voice for the language exists. */
export function deviceSource(): VoiceSource {
  if (typeof speechSynthesis !== 'undefined') {
    // Chrome fills the list asynchronously.
    speechSynthesis.getVoices();
    speechSynthesis.addEventListener?.('voiceschanged', () => speechSynthesis.getVoices());
  }
  return {
    name: 'device',
    can: (req) => !!findDeviceVoice(req.lang),
    speak: (req, signal) =>
      new Promise<void>((resolve) => {
        const u = new SpeechSynthesisUtterance(toSpeech(req.text, req.lang));
        const voice = findDeviceVoice(req.lang);
        if (voice) {
          u.voice = voice;
          u.lang = voice.lang;
        }
        u.rate = req.rate === 'slow' ? 0.75 : 0.95;
        u.onend = u.onerror = () => resolve();
        signal.addEventListener('abort', () => resolve());
        speechSynthesis.speak(u);
      }),
    stop: () => {
      if (typeof speechSynthesis !== 'undefined') speechSynthesis.cancel();
    },
  };
}

export function deviceVoiceName(lang: Lang): string | null {
  return findDeviceVoice(lang)?.name ?? null;
}

let state: SpeakingState = null;
const listeners = new Set<() => void>();
function setState(next: SpeakingState) {
  state = next;
  listeners.forEach((l) => l());
}

export type Voice = {
  speak(req: SpeakRequest): Promise<void>;
  stop(): void;
  /** Which source would speak this request ('visual' when none can). */
  sourceFor(req: SpeakRequest): string;
};

/**
 * The fallback chain: recorded → pre-generated → device TTS → visual only.
 * Starting a new line stops the previous one.
 */
export function createVoice(sources: VoiceSource[]): Voice {
  let controller: AbortController | null = null;
  const stop = () => {
    controller?.abort();
    controller = null;
    sources.forEach((s) => s.stop());
    setState(null);
  };
  return {
    stop,
    sourceFor: (req) => sources.find((s) => s.can(req))?.name ?? 'visual',
    async speak(req) {
      stop();
      const c = new AbortController();
      controller = c;
      const source = sources.find((s) => s.can(req));
      setState({ speaker: req.speaker, text: req.text, silent: !source });
      if (source) {
        await source.speak(req, c.signal);
      } else {
        // Visual only: keep the line highlighted for about as long as reading it takes.
        await new Promise<void>((resolve) => {
          const t = setTimeout(resolve, Math.min(6000, 600 + req.text.length * 55));
          c.signal.addEventListener('abort', () => {
            clearTimeout(t);
            resolve();
          });
        });
      }
      if (controller === c) setState(null);
    },
  };
}

/** Who is talking right now (for lip-flap and bubble highlight). */
export function useSpeaking(): SpeakingState {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => state,
    () => null,
  );
}

export const recordedManifest: Record<string, string> = {};
export const generatedManifest: Record<string, string> = {};

/** The default chain used by the apps. Phase 0 has no voice files yet, so the device voice does the talking. */
export const voice = createVoice([
  fileSource('recorded', recordedManifest),
  fileSource('generated', generatedManifest),
  deviceSource(),
]);
