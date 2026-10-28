import { useSettings } from '@khelaghor/core';
import { pick, toBnDigits, tr, type I18n, type Lang } from '@khelaghor/i18n';
import { voice } from '@khelaghor/voice';
import { useCallback } from 'react';

export function useLang(): Lang {
  return useSettings((s) => s.lang);
}

/** `t(text, vars)` in the current language. */
export function useT() {
  const lang = useLang();
  return useCallback((text: I18n, vars?: Record<string, string | number>) => tr(text, lang, vars), [lang]);
}

/** Read a line aloud (if voice is on) through the voice fallback chain. */
export function useSay() {
  const { lang, voice: on, rate } = useSettings();
  return useCallback(
    (text: I18n | string, speaker?: string, key?: string) => {
      if (!on) return;
      void voice.speak({ text: pick(text, lang), lang, rate, speaker, key });
    },
    [lang, on, rate],
  );
}

/** "6.1" → "৬.১" in Bangla. */
export function topicNo(id: string, lang: Lang): string {
  return lang === 'bn' ? toBnDigits(id) : id;
}
