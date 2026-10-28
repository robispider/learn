import { CharacterSvg, type Expression, type Pose } from '@khelaghor/art';
import { pick, type I18n } from '@khelaghor/i18n';
import { IconButton, SpeechBubble } from '@khelaghor/ui';
import { useSpeaking } from '@khelaghor/voice';
import { useEffect, type ReactNode } from 'react';
import { useBook } from '../book';
import { useLang, useSay, useT } from '../hooks';
import { S } from '../strings';

/** A character with a coloured speech box (book colours), a 🔊 button and lip-flap while speaking. */
export function DialogueLine({
  speaker,
  text,
  pose,
  expression,
  autoSay = true,
  children,
  size = 92,
}: {
  speaker: string;
  text: I18n;
  pose?: Pose;
  expression?: Expression;
  autoSay?: boolean;
  children?: ReactNode;
  size?: number;
}) {
  const book = useBook();
  const lang = useLang();
  const t = useT();
  const say = useSay();
  const speaking = useSpeaking();
  const char = book.character(speaker);
  const shown = pick(text, lang);
  const talking = !!speaking && speaking.speaker === speaker && speaking.text === shown && !speaking.silent;
  const active = !!speaking && speaking.text === shown;

  useEffect(() => {
    if (autoSay) say(text, speaker);
    // Say each new line once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shown, speaker]);

  return (
    <div className="kg-line">
      <CharacterSvg
        id={speaker}
        pose={pose ?? (talking ? 'point' : 'idle')}
        expression={expression}
        talking={talking}
        size={size}
        title={char ? pick(char.name, lang) : speaker}
      />
      <SpeechBubble
        color={char?.bubble ?? 'blue'}
        name={char ? pick(char.name, lang) : undefined}
        active={active}
        tail="left"
        action={
          <IconButton label={t(S.listen)} onClick={() => say(text, speaker)} className="kg-line__speak">
            🔊
          </IconButton>
        }
      >
        <span>{shown}</span>
        {children}
      </SpeechBubble>
    </div>
  );
}
