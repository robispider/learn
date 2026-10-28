/**
 * pnpm review:export [--book c3-math]
 * Writes class-<N>/<subject>/review/<book>-strings.md: every user-visible string (glossary first)
 * for the owner's Bangla review. See plan/07-adding-a-book.md §5.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { reviewMarkdown, reviewRows } from '@khelaghor/core';
import { shellStrings } from './shell-strings';
import { books } from './books';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const arg = process.argv.indexOf('--book');
const wanted = arg > 0 ? process.argv[arg + 1] : undefined;

for (const b of books.filter((b) => !wanted || b.data.id === wanted)) {
  const rows = reviewRows(b.data, { shell: shellStrings, ...b.strings });
  const out = join(root, b.folder, 'review', `${b.data.id}-strings.md`);
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, reviewMarkdown(b.data.title.bn, rows));
  console.log(`${b.data.id}: ${rows.length} strings → ${out}`);
}
