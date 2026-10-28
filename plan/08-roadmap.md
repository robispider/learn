# 08 · Roadmap (platform + first book)

Platform work and the first book (Class 3 Math) move together: each phase builds the shared pieces that the book needs next. Book-level detail: [class-3/math/plan/02-roadmap.md](../class-3/math/plan/02-roadmap.md). Estimates are rough, for sequencing only.

## Phase 0 — Foundations + Division slice (≈ 3 weeks)
**Platform**
- Monorepo: pnpm + Turborepo + TS strict + ESLint/Prettier + Vitest + Storybook + Playwright.
- `core` (schemas, progress, storage), `i18n` (bn/en, digits, number words), `ui` (tokens, numpad, bubbles, tabs, celebration), `voice` (device TTS + SFX), `practice` (generator framework, number/MCQ items, hint ladder, mastery).
- `stage`: 2-D SVG layer, drag/snap/tap-to-place, step player, **plus a 2.5-D R3F orthographic layer** and a capability check (to prove the 2-D/2.5-D/3-D architecture early).
- `art`: Rafi, Tuli and Tia parametric SVG (idle, think, point, cheer), plus the plate, biscuit, orange and lemon objects.
- `shell`: minimal map, chapter page, lesson playground, practice screen, settings.
- `kit-operations`: **T5 Plates & Packs** with 2-D and 2.5-D renderers.

**Book**: Class 3 Math topics 6.1, 6.2, 6.5 complete; first glossary review.

**Status (2026-10-28): built.** Everything above exists except: Storybook (replaced by the in-app review page, D11), Playwright, and Howler (D12). Checked in a desktop browser and a phone-sized viewport; bundle: shell + Division ≈ 197 KB gzip, 2.5-D chunk ≈ 240 KB gzip (lazy). The exit checks below are still to do.
✅ **Exit:** children finish the slice alone and find it fun; the owner approves the art direction and Bangla; the 2.5-D view runs smoothly on a low-end phone, or falls back cleanly.

## Phase 1 — MVP: Class 3 Math Ch. 1–8 (≈ 6–8 weeks)
- Kits: `kit-number` (T1 Place-Value Mat 2-D + 2.5-D blocks, T3 Number Line, T14 patterns, charts), `kit-operations` (T2 Column Machine, T4 Array Garden, T7 Bar Model, Fact Family, Operation Machine).
- Practice: all item types, misconception registry, spaced review, Challenge mode.
- Shell: full story map, album and stickers, profiles, streak, page-number search, PWA offline.
- Voice: compare cloud Bangla voices, then pre-generate TTS files.
- Tooling: `review:export/import`, `validate`, `extract-pages`.
- ✅ **Exit:** pilot with a class or several families for 2–3 weeks; pre/post check on Ch. 2, 5 and 6.

## Phase 2 — Fractions, Money, multi-digit × (≈ 4–5 weeks)
- `kit-fraction` (T8), `kit-money` (T9), `kit-operations` T6 Area Model.
- Book: Ch. 5.7–5.9, Ch. 9, Ch. 10.
- First **3-D toy** in production use (e.g. 3-D place-value stack or a 2.5-D shop).

## Phase 3 — Measurement, Geometry, Data + teacher mode (≈ 5–6 weeks)
- `kit-measure` (T10 Ruler & Map, T11 Balance with physics, T12 Clock), `kit-geometry` (T13 Geo Board, **3-D Solids Viewer**), `kit-data` (T15).
- Book: Ch. 11–13 → **Class 3 Math complete**.
- Shell: teacher/projector mode, printable worksheets, parent progress view.

## Phase 4 — Second book
- Pick the next book (suggestion: **Class 4 Math**, which reuses about 80% of the kits, or Class 2 Math).
- Run the [playbook](07-adding-a-book.md); measure how much was reused (target ≥ 70%).
- Optional `apps/portal` listing all books.

## Risks & mitigations
| Risk | Mitigation |
|---|---|
| Shared-package design slows the first book | Phase 0 builds only what the slice needs; extract more as real needs appear |
| 3-D hurts low-end phones | 2-D required, 3-D lazy and optional, capability check, test on a real cheap phone every week |
| Generated art looks amateur | Style guide, review page per character, iterate early (Phase 0 exit gate) |
| Device TTS quality in Bangla varies | Pre-generated neural TTS files from Phase 1; recorded voice later |
| Bangla wording errors | Owner review workflow; glossary first; no release with unapproved strings |
| Scope (13 chapters × many books) | Ship by phase; kits first; content is data |
