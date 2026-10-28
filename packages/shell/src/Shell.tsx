import { useSettings } from '@khelaghor/core';
import { parseNumber, pick } from '@khelaghor/i18n';
import { setSfxEnabled, unlockAudio } from '@khelaghor/voice';
import { MotionConfig } from 'motion/react';
import { useEffect } from 'react';
import { HashRouter, Navigate, Route, Routes, useParams } from 'react-router';
import { BookProvider, useBook, type Book } from './book';
import { ChapterScreen } from './screens/ChapterScreen';
import { GameScreen } from './screens/GameScreen';
import { LessonScreen } from './screens/LessonScreen';
import { MapScreen } from './screens/MapScreen';
import { ReviewScreen } from './screens/ReviewScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import './shell.css';

/** `#/page/73` → the topic on that book page (or its chapter). */
function PageRoute() {
  const { n = '' } = useParams();
  const book = useBook();
  const { chapter, topic } = book.findPage(parseNumber(n));
  if (topic) return <Navigate to={`/t/${topic.id}/explore`} replace />;
  if (chapter) return <Navigate to={`/ch/${chapter.id}`} replace />;
  return <Navigate to="/" replace />;
}

/** The whole app for one book. A book app is just `<Shell book={book} />`. */
export function Shell({ book }: { book: Book }) {
  const lang = useSettings((s) => s.lang);
  const sfx = useSettings((s) => s.sfx);
  const motion = useSettings((s) => s.reducedMotion);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.title = pick(book.data.title, lang);
  }, [lang, book]);

  useEffect(() => setSfxEnabled(sfx), [sfx]);

  // Mobile browsers only allow audio after a tap.
  useEffect(() => {
    const unlock = () => unlockAudio();
    window.addEventListener('pointerdown', unlock, { once: true });
    return () => window.removeEventListener('pointerdown', unlock);
  }, []);

  return (
    <MotionConfig reducedMotion={motion === 'system' ? 'user' : motion === 'on' ? 'always' : 'never'}>
      <BookProvider book={book}>
        <HashRouter>
          <Routes>
            <Route path="/" element={<MapScreen />} />
            <Route path="/ch/:chapterId" element={<ChapterScreen />} />
            <Route path="/t/:topicId/:mode?" element={<LessonScreen />} />
            <Route path="/game/:gameId" element={<GameScreen />} />
            <Route path="/page/:n" element={<PageRoute />} />
            <Route path="/settings" element={<SettingsScreen />} />
            <Route path="/review" element={<ReviewScreen />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </HashRouter>
      </BookProvider>
    </MotionConfig>
  );
}
