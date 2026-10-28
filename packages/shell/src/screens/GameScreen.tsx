import { pick } from '@khelaghor/i18n';
import { useCallback } from 'react';
import { Navigate, useParams } from 'react-router';
import { useBook } from '../book';
import { TopBar } from '../components/TopBar';
import { useLang } from '../hooks';

/** Frame for a 60-second mini-game from a kit. */
export function GameScreen() {
  const { gameId = '' } = useParams();
  const book = useBook();
  const lang = useLang();
  const game = book.games[gameId];
  const onFinish = useCallback(() => {}, []);
  if (!game) return <Navigate to="/" replace />;
  const G = game.component;
  return (
    <div className="kg-screen">
      <TopBar back="/" title={`🎮 ${pick(game.title, lang)}`} />
      <main className="kg-page">
        <G lang={lang} onFinish={onFinish} />
      </main>
    </div>
  );
}
