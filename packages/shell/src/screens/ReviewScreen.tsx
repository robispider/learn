import {
  CharacterSvg,
  EXPRESSIONS,
  ITEM_KINDS,
  Item,
  KID_IDS,
  POSES,
  Plate,
  Bag,
  STICKER_IDS,
  Sticker,
} from '@khelaghor/art';
import { reviewMarkdown, reviewRows } from '@khelaghor/core';
import { pick } from '@khelaghor/i18n';
import { Button, Tabs } from '@khelaghor/ui';
import { useMemo, useState } from 'react';
import { useBook } from '../book';
import { TopBar } from '../components/TopBar';
import { useLang, useT } from '../hooks';
import { S } from '../strings';

/** For the project owner: every character pose at phone size, the object library, and all text for review. */
export function ReviewScreen() {
  const book = useBook();
  const lang = useLang();
  const t = useT();
  const [tab, setTab] = useState('characters');
  const [talking, setTalking] = useState(false);
  const rows = useMemo(() => reviewRows(book.data, { shell: S, ...book.strings }), [book]);
  const cast = book.data.characters.map((c) => c.id);

  const download = () => {
    const md = reviewMarkdown(pick(book.data.title, 'bn'), rows);
    const url = URL.createObjectURL(new Blob([md], { type: 'text/markdown;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `${book.data.id}-strings.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="kg-screen">
      <TopBar back="/settings" title={`🧑‍🎨 ${t(S.review)}`} />
      <main className="kg-page">
        <Tabs
          label="review"
          value={tab}
          onChange={setTab}
          items={[
            { id: 'characters', label: t(S.rvCharacters) },
            { id: 'objects', label: t(S.rvObjects) },
            { id: 'strings', label: t(S.rvStrings) },
          ]}
        />
        {tab === 'characters' && (
          <>
            <label className="kg-row">
              <input type="checkbox" checked={talking} onChange={(e) => setTalking(e.target.checked)} />{' '}
              {t(S.rvTalk)}
            </label>
            {cast.map((id) => (
              <section key={id} className="kg-card kg-review-row">
                <h2 className="kg-h2">{pick(book.character(id)?.name, lang)}</h2>
                <div className="kg-review-grid">
                  {POSES.map((p) => (
                    <figure key={p}>
                      <CharacterSvg id={id} pose={p} talking={talking} size={130} />
                      <figcaption>{p}</figcaption>
                    </figure>
                  ))}
                  {EXPRESSIONS.map((e) => (
                    <figure key={e}>
                      <CharacterSvg id={id} expression={e} talking={talking} size={130} />
                      <figcaption>{e}</figcaption>
                    </figure>
                  ))}
                </div>
              </section>
            ))}
            <section className="kg-card kg-review-row">
              <h2 className="kg-h2">kids</h2>
              <div className="kg-review-grid">
                {KID_IDS.map((id) => (
                  <figure key={id}>
                    <CharacterSvg id={id} pose="wave" size={130} />
                    <figcaption>{id}</figcaption>
                  </figure>
                ))}
              </div>
            </section>
          </>
        )}
        {tab === 'objects' && (
          <section className="kg-card kg-review-grid">
            {ITEM_KINDS.map((k) => (
              <figure key={k}>
                <svg viewBox="-30 -30 60 60" width={90} height={90}>
                  <Item kind={k} />
                </svg>
                <figcaption>{k}</figcaption>
              </figure>
            ))}
            {ITEM_KINDS.map((k) => (
              <figure key={`g-${k}`}>
                <svg viewBox="-30 -30 60 60" width={90} height={90}>
                  <Item kind={k} ghost />
                </svg>
                <figcaption>{k} (ghost)</figcaption>
              </figure>
            ))}
            <figure>
              <svg viewBox="-70 -30 140 60" width={160} height={70}>
                <Plate w={120} />
              </svg>
              <figcaption>plate</figcaption>
            </figure>
            <figure>
              <svg viewBox="-50 -90 100 100" width={90} height={90}>
                <Bag />
              </svg>
              <figcaption>bag</figcaption>
            </figure>
            {STICKER_IDS.map((s) => (
              <figure key={s}>
                <Sticker id={s} size={90} />
                <figcaption>{s}</figcaption>
              </figure>
            ))}
          </section>
        )}
        {tab === 'strings' && (
          <section className="kg-card">
            <div className="kg-row" style={{ justifyContent: 'space-between', flexWrap: 'wrap' }}>
              <span>{t(S.rvCount, { n: rows.length })}</span>
              <Button variant="primary" onClick={download}>
                ⬇ {t(S.rvDownload)}
              </Button>
            </div>
            <div className="kg-table-wrap">
              <table className="kg-table">
                <thead>
                  <tr>
                    <th>key</th>
                    <th>বাংলা</th>
                    <th>English</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.key}>
                      <td>
                        <code>{r.key}</code>
                      </td>
                      <td>{r.bn}</td>
                      <td>{r.en}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
