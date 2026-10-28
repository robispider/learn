/** Bangla review export: every user-visible string with a stable key, for the owner to proofread. */
export type ReviewRow = { key: string; bn: string; en: string };

function isI18n(v: unknown): v is { bn: string; en?: string } {
  return (
    !!v &&
    typeof v === 'object' &&
    typeof (v as { bn?: unknown }).bn === 'string' &&
    Object.keys(v).every((k) => k === 'bn' || k === 'en')
  );
}

/** Walk any object and collect every `{ bn, en }` text with its path as the key. */
export function collectStrings(value: unknown, prefix: string, out: ReviewRow[] = []): ReviewRow[] {
  if (isI18n(value)) {
    out.push({ key: prefix, bn: value.bn, en: value.en ?? '' });
  } else if (Array.isArray(value)) {
    value.forEach((v, i) => {
      const id =
        v && typeof v === 'object' && typeof (v as { id?: unknown }).id === 'string'
          ? (v as { id: string }).id
          : String(i);
      collectStrings(v, `${prefix}.${id}`, out);
    });
  } else if (value && typeof value === 'object') {
    for (const [k, v] of Object.entries(value)) collectStrings(v, prefix ? `${prefix}.${k}` : k, out);
  }
  return out;
}

/**
 * All strings for one book app: the glossary first (reviewed first, since other text reuses its terms),
 * then the book content, then shared shell and kit strings.
 */
export function reviewRows(
  book: { id: string; glossary: unknown[] } & Record<string, unknown>,
  shared: Record<string, unknown>,
): ReviewRow[] {
  const glossary = (book.glossary as { id: string; bn: string; en: string; definition?: unknown }[]).flatMap(
    (g) => [
      { key: `glossary.${g.id}`, bn: g.bn, en: g.en },
      ...collectStrings(g.definition, `glossary.${g.id}.definition`),
    ],
  );
  const rest = { ...book, glossary: undefined };
  return [...glossary, ...collectStrings(rest, book.id), ...collectStrings(shared, '')];
}

const cell = (s: string) => s.replace(/\|/g, '\\|').replace(/\n/g, ' ');

/** A Markdown table the reviewer edits: change the Bangla column, put ✔ in "ok" to approve. */
export function reviewMarkdown(title: string, rows: ReviewRow[]): string {
  const lines = [
    `# Bangla review — ${title}`,
    '',
    'Edit the **bn** column to correct the text, or write a note in **comment**. Put ✔ in **ok** to approve a row.',
    `Generated file; re-export after content changes. Rows: ${rows.length}.`,
    '',
    '| ok | key | bn | en | comment |',
    '|---|---|---|---|---|',
    ...rows.map((r) => `|  | \`${r.key}\` | ${cell(r.bn)} | ${cell(r.en)} |  |`),
    '',
  ];
  return lines.join('\n');
}
