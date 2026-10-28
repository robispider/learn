# 05 · Tech stack and repository

## Requirements that drive the choice
- **2-D, 2.5-D and 3-D** visuals and interactions on the *same* stage, with one input model (drag, snap, tap).
- Runs on **low-end Android phones**, offline after the first load; 3-D is an enhancement with a 2-D fallback.
- **Reusable packages** shared by many book apps.
- UI-heavy (Bangla text, forms, numpads, menus) as much as it is graphics-heavy → DOM text must stay first-class, because Bangla shaping in canvas/WebGL text is weaker.
- Content as data, validated, so lessons can be written without touching toy code.

## Decision: React + TypeScript, with SVG for 2-D and react-three-fiber for 3-D
| Layer | Choice | Why |
|---|---|---|
| Language & build | **TypeScript + Vite** | Fast dev server, static output, good library mode for packages |
| UI | **React** | Huge ecosystem; react-three-fiber gives React-style 3-D in the same tree |
| **2-D** | **SVG in React** + **Motion** (Framer Motion) for gestures, springs, layout animation | Crisp at any size, accessible DOM, real Bangla text, easy hit-testing |
| **2.5-D** | Two options, same API in `@khelaghor/stage`: (a) **isometric SVG** via a projection helper `iso(x,y,z)` for light scenes; (b) **react-three-fiber with an orthographic camera** for scenes that need depth sorting, shadows or many objects (blocks, shop shelves, plates on a table) | Cheap where it can be, real depth where it must be |
| **3-D** | **three.js** via **@react-three/fiber** + **@react-three/drei** (controls, `<Html>` labels, environment) | Declarative 3-D inside React; shares state with 2-D overlays; large community |
| Physics (optional) | **@react-three/rapier** | Balance scale, dropping blocks, rolling solids. Loaded only by toys that need it |
| Labels over 3-D | drei `<Html>` or the SVG overlay layer | Keeps Bangla text in the DOM |
| State | **Zustand** (app, progress) + pure per-toy reducers | Simple; reducers allow undo, replay and validation |
| Content validation | **zod** | One schema validates lesson JSON at build time and gives types |
| Routing | React Router (hash routes) | Works on static hosting; deep links by topic and book page |
| Audio | **Howler.js** + Web Speech API | Sprites, mobile unlock; TTS fallback chain in `@khelaghor/voice` |
| Offline | **vite-plugin-pwa** (Workbox) | Installable, precaches a chapter's assets |
| Storage | IndexedDB (idb-keyval) with a localStorage fallback | Profiles and progress on the device |
| Monorepo | **pnpm workspaces + Turborepo** | Shared packages, cached builds, one install |
| Component workshop | **Storybook** | Build and review toys in isolation, with configs for several classes |
| Tests | **Vitest** (reducers, generators, i18n), **Playwright** (flows, screenshots) | Generators must never produce invalid items |
| Lint/format | ESLint + Prettier, TypeScript strict | — |
| Hosting | **Vercel** (like the inspiration sites), one project per book app; preview deploys per branch | Free, simple |

### Alternatives considered
| Option | Why not (as the main stack) |
|---|---|
| Single HTML file (earlier prototype) | Cannot share packages across books; no build, tests or offline caching; becomes unmaintainable past one book |
| PixiJS (2-D canvas/WebGL) | Excellent 2-D performance, but Bangla text and accessibility are weaker, and 3-D would need a second engine. Kept as a possible renderer for one very heavy toy if SVG ever struggles |
| Phaser | A game engine; weak for UI-heavy lesson screens and React integration |
| Babylon.js | Strong 3-D, but heavier and less natural in a React tree than R3F |
| Svelte + Threlte | Lighter, but a smaller ecosystem for both 3-D and education UI; React is easier for future contributors |
| Unity / Godot (WebGL export) | Large downloads, poor fit for low-end phones and Bangla UI text |

### How 3-D stays affordable on cheap phones
- 3-D code is **lazy-loaded per toy**; the shell and 2-D toys never download three.js.
- `frameloop="demand"` (render only when something changes); capped device pixel ratio; low-poly procedural meshes; no large textures.
- On startup a **capability check** (WebGL2, memory, frame time) picks **2-D / 2.5-D / 3-D** as the default; the child can switch if supported.
- Every toy's **2-D renderer is required**, so a lesson always works.

## Repository layout
```
learn/
  README.md
  plan/                       ← platform vision & plan (this folder; shared by all books)
  packages/                   ← shared code (created in Phase 0)
    core/  i18n/  ui/  stage/  practice/  voice/  art/  shell/
    kit-number/  kit-operations/  kit-fraction/  kit-money/
    kit-measure/  kit-geometry/  kit-data/
  class-3/
    math/                     ← one book = one folder
      README.md
      book-references/        original PDF (not shipped)
      references/             page images + chapter notes
      plan/                   book plan: curriculum map, book profile, book roadmap
      content/                @khelaghor/book-c3-math: chapters/*.json, glossary, theme, map, stickers, book-only toys
      app/                    thin Vite app: <Shell book={class3Math} />, PWA manifest, deploy config
  class-4/
    math/ …                   (future) same shape
  apps/
    portal/                   (optional, later) one site listing all books
  tooling/                    scripts: page extraction, TTS pre-generation, Bangla review export
  pnpm-workspace.yaml  turbo.json  tsconfig.base.json
```
The book app is tiny:
```tsx
import { Shell } from '@khelaghor/shell';
import book from '@khelaghor/book-c3-math';
export default () => <Shell book={book} />;
```

## Content model
```ts
type Book = {
  id: 'c3-math'; class: 3; subject: 'math';
  title: I18n;                       // তৃতীয় শ্রেণির গণিত খেলাঘর
  source: { publisher: 'NCTB'; edition: '2025'; pageOffset: 6 };
  theme: ThemeOverrides; characters: CharacterRef[]; modeSymbols: ModeSymbolMap;
  map: MapDefinition; stickers: StickerSet; glossary: GlossaryEntry[];
  chapters: Chapter[];
};
type Chapter = { id: 'ch06'; no: 6; title: I18n; bookPages: [63, 77]; place: MapPlaceId; topics: Topic[] };
type Topic = {
  id: '6.5'; title: I18n; bookPages: [73, 74]; phase: 0 | 1 | 2 | 3;
  learn: { rule: I18n; vocab: GlossaryId[] };
  explore: { toy: ToyId; config: unknown; hook: Dialogue[] };
  try: { toy: ToyId; config: unknown; steps: Step[] }[];
  practice: { templates: TemplateRef[]; misconceptions: MisconceptionId[] };
  game?: GameRef; sticker: StickerId;
};
type Step = { say?: CharacterId; text: I18n; expect?: unknown; hints?: I18n[]; showMe?: unknown };
```
Content is checked against the toy schemas at build time (`pnpm validate`).

## Performance budgets
- Shell + one 2-D chapter: ≤ 300 KB JS gzip on first load; chapters and 3-D lazy-loaded.
- 3-D chunk (three + R3F + drei subset): loaded only on toys that use it; target ≤ 250 KB gzip.
- 60 fps drag on a mid Android phone (~2 GB RAM); 3-D scenes ≥ 30 fps or fall back to 2-D.
- SVG ≤ ~1,500 nodes per stage (reuse with `<use>`; 99,999 is drawn as 9+9+9+9+9 pieces, never 99,999 cubes).

## Privacy & safety
No login and no analytics by default. Any analytics is anonymous, aggregate, opt-in and documented. No external links in kid mode. A grown-ups gate protects settings and progress reset.
