import { topicStars, useProgress, useSettings } from '@khelaghor/core';
import { pick } from '@khelaghor/i18n';
import { IconButton, ProgressChip } from '@khelaghor/ui';
import { voice } from '@khelaghor/voice';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router';
import { useBook } from '../book';
import { useLang, useT } from '../hooks';
import { S } from '../strings';

export function TopBar({ back, title }: { back?: string; title?: ReactNode }) {
  const book = useBook();
  const lang = useLang();
  const t = useT();
  const nav = useNavigate();
  const settings = useSettings();
  const progress = useProgress((s) => s.books[book.data.id]);
  const stars = book.topics.reduce((n, { topic }) => n + topicStars(progress?.[topic.id]), 0);
  return (
    <header className="kg-topbar">
      {back !== undefined ? (
        <IconButton label={t(S.back)} onClick={() => nav(back)}>
          ←
        </IconButton>
      ) : (
        <span className="kg-topbar__logo" aria-hidden>
          🏡
        </span>
      )}
      <div className="kg-topbar__title">{title ?? pick(book.data.title, lang)}</div>
      <ProgressChip stars={stars} total={book.topics.length * 3} lang={lang} />
      <IconButton
        label={t(settings.voice ? S.voiceOn : S.voiceOff)}
        aria-pressed={settings.voice}
        onClick={() => {
          if (settings.voice) voice.stop();
          settings.set({ voice: !settings.voice });
        }}
      >
        {settings.voice ? '🔊' : '🔇'}
      </IconButton>
      <button
        type="button"
        className="kg-lang"
        aria-label={t(S.langSwitch)}
        onClick={() => settings.set({ lang: lang === 'bn' ? 'en' : 'bn' })}
      >
        <span aria-pressed={lang === 'bn'}>বাংলা</span>
        <span aria-pressed={lang === 'en'}>EN</span>
      </button>
      <IconButton label={t(S.settings)} onClick={() => nav('/settings')}>
        ⚙
      </IconButton>
    </header>
  );
}
