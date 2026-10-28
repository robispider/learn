# খেলাঘর — platform plan (all books)

Interactive, visual and fun learning + practice apps for Bangladeshi primary students, built on the NCTB textbooks. **One book = one folder** (`class-<N>/<subject>/`). Everything that can be shared lives at the top level: this plan, and later the `packages/` (platform + subject kits).

**Status:** Phase 0 built (shared packages in [`/packages`](../packages/README.md), Class 3 Math Division slice). Waiting on the owner's art and Bangla review and a low-end phone test. See [decisions](decisions.md) D10–D14.

## Read in this order
| # | Doc | What it covers |
|---|---|---|
| 01 | [Vision & principles](01-vision-and-principles.md) | Why a platform, who it's for, 10 principles |
| 02 | [Learning design](02-learning-design.md) | Explore → Try → Practice → Challenge, CPA ladder, hints, misconceptions, practice engine, motivation |
| 03 | [Experience & UI](03-experience-and-ui.md) | Shared shell: story map, lesson playground with 2-D/2.5-D/3-D stage, style, accessibility |
| 04 | [Packages & kits](04-packages-and-kits.md) | Platform packages, math kits and their toys (T1–T15 and more), toy contract, what goes where |
| 05 | [Tech stack & repo](05-tech-stack.md) | React + SVG + react-three-fiber, monorepo layout, content model, performance budgets |
| 06 | [Art & voice](06-art-and-voice.md) | Generated parametric SVG art; TTS fallback chain |
| 07 | [Adding a book](07-adding-a-book.md) | Playbook: references → plan → content → Bangla review → ship |
| 08 | [Roadmap](08-roadmap.md) | Phase 0 (Division slice) → Class 3 Math complete → second book |
| — | [Decisions log](decisions.md) | What's decided, and what's still open |

## Books
| Book | Folder | App name | Status |
|---|---|---|---|
| Class 3 Math (NCTB 2025) | [`class-3/math/`](../class-3/math/README.md) | তৃতীয় শ্রেণির গণিত খেলাঘর | Phase 0 built: topics 6.1, 6.2, 6.5 |

## In one paragraph
Each book app mirrors its textbook: same chapters, words, characters and activity symbols. Every topic runs Explore (story + toy), Try (guided), Practice (generated, adaptive) and a Learn card, and each chapter ends in a Challenge. Ideas go concrete → picture → symbol. The toys come from shared **kits** (number, operations, fraction, money, measure, geometry, data). Each toy has a required 2-D view and optional 2.5-D/3-D views, configured per lesson by data, so a new book is mostly content. Fun comes from a story map, stickers, a companion character and 60-second skill games. The apps are Bangla first, have voice everywhere, and work offline on cheap phones.
