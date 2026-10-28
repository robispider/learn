# Class 3 · গণিত (NCTB) — তৃতীয় শ্রেণির গণিত খেলাঘর

One book = one folder (`class-<N>/<subject>/`). This folder holds everything specific to the Class 3 Mathematics book. Shared plans and code live at the repo top level: [`/plan`](../../plan/README.md), and later `/packages`.

| Folder | What's inside |
|---|---|
| [`book-references/`](book-references/) | The original book PDF (NCTB, 2025 reprint, 162 pages, no text layer) |
| [`references/`](references/) | What we extracted from the book: [`book-overview.md`](references/book-overview.md) (chapter and page map, characters, symbols, visual index), [`chapters/`](references/chapters/) (one note per chapter), and [`pages/`](references/pages/) (every page as a JPG, `pNNN.jpg` = PDF page; book page = PDF page − 6) |
| [`plan/`](plan/) | The book plan: book profile, curriculum map, roadmap. Start at [`plan/README.md`](plan/README.md) |
| [`content/`](content/) | `@khelaghor/book-c3-math`: [`src/data.ts`](content/src/data.ts) (book profile, map places, stub chapters), [`src/chapters/ch06.json`](content/src/chapters/ch06.json) (topics 6.1, 6.2, 6.5), [`src/glossary.json`](content/src/glossary.json); `pnpm validate` checks it |
| [`app/`](app/) | Thin Vite app: `<Shell book={book} />` (`pnpm dev`) |
| [`review/`](review/) | Bangla review file from `pnpm review:export`: correct the bn column, ✔ to approve |
