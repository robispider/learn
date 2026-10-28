import type { Topic } from '@khelaghor/core';
import { pick } from '@khelaghor/i18n';
import { useBook } from '../book';
import { topicNo, useLang, useT } from '../hooks';
import { S } from '../strings';

/** Side-panel title: "৬.১ · অধ্যায় ৬" over the lesson name. */
export function PanelHead({ topic, children }: { topic: Topic; children?: React.ReactNode }) {
  const book = useBook();
  const lang = useLang();
  const t = useT();
  const chapter = book.topic(topic.id)?.chapter;
  return (
    <header className="kg-panel-head">
      <span className="kg-kicker">
        {topicNo(topic.id, lang)}
        {chapter && ` · ${t(S.chapter, { n: chapter.no })} ${pick(chapter.title, lang)}`}
      </span>
      <h2>{pick(topic.title, lang)}</h2>
      {children}
    </header>
  );
}
