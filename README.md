# learn — খেলাঘর

Interactive, visual and fun learning + practice apps for Bangladeshi primary students, built on the NCTB textbooks.

```
plan/                 platform vision & plan, shared by all books  → start at plan/README.md
packages/             shared platform packages + subject kits (@khelaghor/*) → packages/README.md
class-3/
  math/               তৃতীয় শ্রেণির গণিত খেলাঘর — references, book plan, content, app
tooling/              repo scripts (Bangla review export)
```

One book = one folder: `class-<N>/<subject>/`. Anything two books could share goes in `plan/` or `packages/`. See [Adding a book](plan/07-adding-a-book.md).

**Status:** Phase 0 is built: the shared packages, the T5 Plates & Packs toy (2-D + 2.5-D), and Class 3 Math topics 6.1, 6.2 and 6.5. Waiting on the owner's review of the art and the Bangla. See [plan/08-roadmap.md](plan/08-roadmap.md).

## Run it
Needs Node 20+ and pnpm 10 (`npm i -g pnpm`).

```bash
pnpm install
pnpm dev               # Class 3 Math app on http://localhost:5173 (also on your Wi-Fi, for phones)
pnpm test              # unit tests (i18n, mastery, toy reducer, 10,000-item generator checks, content)
pnpm typecheck
pnpm lint
pnpm validate          # checks every lesson against its toy, templates, words and stickers
pnpm review:export     # writes class-3/math/review/c3-math-strings.md for Bangla review
pnpm build             # static site in class-3/math/app/dist
```

In the app, the grown-ups' settings (⚙, behind a small sum) link to the **review page**: every character pose, the object library, all strings, and a download of the review file.
