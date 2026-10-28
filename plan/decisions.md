# Decisions log

| # | Date | Decision | Notes |
|---|---|---|---|
| D1 | 2026-10-28 | **Folder layout: `class-<N>/<subject>/`**, one book per folder (first: `class-3/math/`) | Lets several subjects of one class sit side by side |
| D2 | 2026-10-28 | **Platform vision and plan live at the top level** (`/plan`); books hold only book-specific plans | Shared by all classes and subjects |
| D3 | 2026-10-28 | **Shared packages and kits** (`/packages`): platform packages + subject kits; book folders hold content and thin apps | Avoids rebuilding the same toys per book. See [04](04-packages-and-kits.md) |
| D4 | 2026-10-28 | **Platform name খেলাঘর**; first app **তৃতীয় শ্রেণির গণিত খেলাঘর** | Book apps are named `<শ্রেণি> <বিষয়> খেলাঘর`; package scope `@khelaghor/*` |
| D5 | 2026-10-28 | **Stack: TypeScript + Vite + React; SVG + Motion for 2-D; isometric SVG or R3F orthographic for 2.5-D; three.js via react-three-fiber + drei for 3-D; optional Rapier physics; pnpm + Turborepo monorepo** | Handles 2-D, 2.5-D and 3-D on one stage with one input model, keeps Bangla text in the DOM. See [05](05-tech-stack.md) |
| D6 | 2026-10-28 | **First slice: Class 3 Math, Ch. 6 Division** (6.1, 6.2, 6.5) | Richest visual metaphor; exercises all shared parts |
| D7 | 2026-10-28 | **Art is generated in code** (parametric SVG characters + object library; procedural 3-D) | No illustrator. See [06](06-art-and-voice.md) |
| D8 | 2026-10-28 | **Voice: TTS for now** (device TTS in Phase 0, pre-generated neural TTS files from Phase 1); recorded voice can replace it later | `@khelaghor/voice` fallback chain |
| D9 | 2026-10-28 | **The project owner reviews all Bangla and NCTB alignment** | Export/import review workflow, see [07](07-adding-a-book.md#5-bangla-review-workflow) |

| D10 | 2026-10-28 | **Tool versions pinned to well-known majors** for Phase 0: React 19, Vite 7, TypeScript 5.9, Vitest 3, ESLint 9, zod 4, Motion 12, three 0.180 + R3F 9, React Router 7 | Newer majors exist (Vite 8, TS 7, Vitest 5…); upgrade in one step later rather than mid-build |
| D11 | 2026-10-28 | **In-app review page instead of Storybook** for Phase 0 (`#/review`: every pose, object, sticker and string, plus the review-file download) | The owner reviews on a phone, inside the real app. Storybook can come back when more people build toys |
| D12 | 2026-10-28 | **Sound effects synthesised with Web Audio**, not Howler sprites | No audio files to make or download; Howler can return with recorded voice |
| D13 | 2026-10-28 | **Topic 6.5 uses oranges (কমলালেবু)** as on book p.73, not lemons as the draft script said; remainder sentences use the book's "অবশিষ্ট", the chip label is "ভাগশেষ" | Follows the book; owner to confirm |
| D14 | 2026-10-28 | Content JSON shows the **book's exact problems** (12 biscuits, Reza's 14 oranges, 19 chocolates) as short factual prompts; all art is redrawn | Book-aligned, not book-copied |
| D15 | 2026-10-28 | **Lesson screen = workbench** modelled on learn-arduino / learn-esp32: rail, chapter card + drawer, stage with callouts and a dock, mode tabs in a side panel, a live "math language" box with ▶ play, and a lesson strip | Owner kept the map and story; asked for that UI/UX so kids can switch chapter/lesson, interact, change parts, experiment, add complexity, take hints and check understanding |
| D16 | 2026-10-28 | **New mode 🎛️ বদলে দেখি (lab)** with knobs and a ★–★★★ challenge ladder per topic; tab order Explore → Try → Lab → Learn → Practice | Not a book mode, so it has the app's own symbol; challenges are content (`topic.lab`) and are checked to be solvable |
| D17 | 2026-10-28 | **One view per scene, chosen by the lesson** (`view` on a toy block; no 2D/2.5D switch). **Simulation info lives on the stage** (math row on top, status + action at the bottom, dock on the right); the side panel only tells the lesson | Owner: the same thing doesn't need 2-D and 2.5-D together, and the panels were overlapping and repeating. Settings keep "2-D only" for slow phones |
| D18 | 2026-10-29 | **Workbench v2**: the toy's knobs and the tools form a rail on the stage's **left edge** (knobs work in the lab, shown locked elsewhere); the "গণিতের ভাষায়" row becomes a small **run pill** on the stage plus a full **▶ চালাও tab** in the side panel (▶ on the stage plays and opens it); **practice questions sit on the stage**, the panel keeps only answering and navigation | Owner's redesign of the existing screen (design canvas "Playroom v2 — Existing Layout"). Answering on the stage itself (drag-to-answer items) needs a new practice item type: not built yet |

## Still open (decide when we get there)
- Phase 0 leftovers: the ribbon-cutting Try step for 6.5 (needs a small ruler toy), Playwright smoke tests, a real low-end phone test of the 2.5-D view.
- Cloud TTS service for pre-generated Bangla voice (compare 2–3 in Phase 1).
- Second book after Class 3 Math.
- Whether to add a combined `apps/portal` site.
