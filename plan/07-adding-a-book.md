# 07 · Playbook: adding a book

Every book follows the same path. Class 3 Math (`class-3/math/`) is the reference example.

## 1. Create the folder
```
class-<N>/<subject>/
  README.md
  book-references/     the official PDF
  references/          extracted understanding
  plan/                book plan
  content/             (when building) lessons + theme
  app/                 (when building) thin app
```
Folder names: `class-1` … `class-5`; subjects `math`, `bangla`, `english`, `science`, `bgs`, …

## 2. Extract references
1. Render every page to `references/pages/pNNN.jpg` (`tooling/extract-pages`, about 1100 px wide). NCTB PDFs often have no text layer, so reading the images is the reliable route.
2. Note the **page offset** (PDF page − book page).
3. Write `references/book-overview.md`: chapter map with book and PDF pages, characters, activity symbols, recurring visual language, teaching sequence, and a **visual index** (visuals worth recreating, with page numbers).
4. Write one note per chapter in `references/chapters/chNN-<slug>.md` using the template below.

### Chapter note template
```markdown
# অধ্যায় N — <Bangla title> (<English>)
- Book pages · PDF pages · scope / number range
## Sections in the book        (table: # · topic · book p. · what the book does)
## Vocabulary                  (Bangla term (English) …)
## Book visuals worth reusing  (what to redraw, and what it's for)
## Exercise types seen
## Interactive / fun ideas     (which toy, what interaction, which game)
```

## 3. Plan the book
In `plan/`:
- `README.md`: **book profile**: app name, characters, mode symbols, map theme, stickers, the kits used, and gaps.
- `01-curriculum-map.md`: every topic → book pages → toy (kit code) → Explore/Try → Practice template → game → phase.
- `02-roadmap.md`: the phases for this book.

**Kit gap check:** for each topic, can an existing toy plus config do it? If not, write down the missing capability. Prefer **extending a kit** over a book-only toy.

## 4. Build the content
- `content/chapters/chNN.json` (validated by zod), `glossary.json`, `theme.ts`, `map.ts`, `stickers.ts`.
- Book-specific practice generators only when a kit template can't express it.
- Run `pnpm validate` (schemas), `pnpm test` (generators), then review in Storybook and in the app.

## 5. Bangla review workflow
The project owner is the Bangla and NCTB reviewer.
1. `pnpm review:export --book c3-math` writes `review/<book>-strings.md`, a table of key · Bangla · English · where it's used (chapter/topic/screen) · book page.
2. The reviewer edits the Bangla column or adds a comment (`✔` to approve).
3. `pnpm review:import` applies the changes; nothing is released with unapproved strings.
4. The glossary is reviewed first, because all other text reuses its terms.

## 6. Ship
- Vercel project for `class-<N>/<subject>/app`, PWA manifest with the book name and icon.
- Pilot with a few children → fix → release.

## Done checklist for a new book
- [ ] references complete (overview + every chapter)
- [ ] book profile + curriculum map approved
- [ ] kit gaps resolved (in kits, not in the book where possible)
- [ ] all Bangla strings approved
- [ ] every topic has Explore, Try and Practice; every chapter has a Challenge
- [ ] works offline; 2-D fallback checked on a low-end phone
