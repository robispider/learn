# 04 · Shared packages and kits

**Goal:** a new book should be mostly **content + configuration**. Anything two books could use goes in a shared package. Book folders hold only book-specific content, themes and rare book-only toys.

## Layers

```
┌────────────────────────────────────────────────────────────────┐
│ Book apps        class-3/math/app   class-4/math/app   …       │  thin: config + content
├────────────────────────────────────────────────────────────────┤
│ Book content     class-3/math/content (@khelaghor/book-c3-math)│  chapters, topics, glossary,
│                                                                 │  book generators, theme, map
├────────────────────────────────────────────────────────────────┤
│ Subject kits     kit-number · kit-operations · kit-fraction ·  │  toys + generators +
│ (math first)     kit-money · kit-measure · kit-geometry ·      │  misconceptions + art
│                  kit-data   (later: kit-bangla, kit-science…)  │
├────────────────────────────────────────────────────────────────┤
│ Platform         shell · stage · practice · ui · art · voice · │  same for every book
│                  i18n · core                                   │
└────────────────────────────────────────────────────────────────┘
```
Dependencies only point **down**. Kits never import a book. Platform never imports a kit.

## Platform packages
| Package | What it provides |
|---|---|
| `@khelaghor/core` | Content schema (zod) and types: Book, Chapter, Topic, Step, PracticeTemplate; progress and mastery rules; seeded RNG; storage wrapper (IndexedDB/localStorage); profiles |
| `@khelaghor/i18n` | `t(key)`, bn/en string loading, `toBnDigits()`, **Bangla number words** (lakh/crore aware), Indian digit grouping, ordinals (প্রথম, ২য়…), units formatting (৳, কেজি, মিটার) |
| `@khelaghor/ui` | Design tokens (incl. place-value colours), theme system (book overrides), buttons, tabs, numpad, speech bubbles, cards, lesson strip, progress chip, celebrations, dialogs |
| `@khelaghor/stage` | The **layered stage**: SVG 2-D layer, isometric 2.5-D helpers, a lazy-loaded **3-D layer (react-three-fiber)**, hotspots and labels, a unified **drag/snap/tap-to-place** system that works across all layers, camera toolbar (zoom/rotate/reset/2D↔3D), animation helpers, step player, WebGL capability check and 2-D fallback |
| `@khelaghor/practice` | Generator framework, item renderers (number, MCQ, fill, match, order, build), hint ladder, misconception registry, mastery and adaptivity, spaced review ("আজকের ৫টি") |
| `@khelaghor/voice` | `speak(key)` with fallbacks (recorded → pre-generated TTS file → device TTS → highlight only), sound-effect sprites, mute and volume, mobile audio unlock |
| `@khelaghor/art` | **Generated SVG art**: parametric characters (poses, expressions, mouth shapes for talking), common objects (fruit, plates, notebooks, coins…), icons, map pieces, plus procedural 3-D primitives (blocks, coins, solids) |
| `@khelaghor/shell` | The app: routing, story map, chapter page, lesson playground, practice/challenge screens, album, profiles, settings, page-number search, PWA setup. Takes a `Book` object and renders everything |

## Math kits and their toys
Each toy follows the **toy contract** (below), has a 2-D renderer, and has an optional 2.5-D/3-D renderer. Config ranges cover **Class 1–5**, so later books reuse the same toy with different settings.

| Code | Toy | Kit | Renders | Range across classes | First used in |
|---|---|---|---|---|---|
| T1 | **Place-Value Mat** — base-10 pieces, auto bundle/unbundle, digits + words, bracket-tree reveal | kit-number | 2-D · 2.5-D blocks · 3-D stack | ones → কোটি; decimals later | C3 Ch1–3, 5, 10 |
| T3 | **Number Line** — zoom, hops, skip counting, fraction ticks | kit-number | 2-D | 0–20 → crores; fractions/decimals | C3 Ch1, 5–7, 9 |
| T14 | **Pattern Studio** — number trains, shape/colour patterns: continue, fix, create | kit-number | 2-D | all classes | C3 Ch1, 12 |
| — | **Number Cards & Chart** — 100-chart, multiplication chart explorer, ordinal line-up | kit-number | 2-D | all classes | C3 Ch1, 5, 6 |
| T2 | **Column Machine** — vertical +, −, ×, long ÷ step by step, carries/borrows linked to T1 | kit-operations | 2-D | 2-digit → multi-digit; long division (C4–5) | C3 Ch2, 3, 5 |
| T4 | **Array Garden** — rows × columns, rotate, split, L-frame tables | kit-operations | 2-D · 2.5-D | ×2 → ×15, factors (C4–5) | C3 Ch5–7 |
| T5 | **Plates & Packs** — share / group, deal rounds, leftovers | kit-operations | 2-D · **2.5-D table scene** | ÷ facts → remainders → fractions of a set | C3 Ch6–8 |
| T6 | **Area Model** — split rectangles, partial products, linked to column method | kit-operations | 2-D | 2d×1d → 3d×3d, distributive law | C3 Ch5 |
| T7 | **Bar / Tape Model** — part-whole, comparison, equal groups, word-problem builder | kit-operations | 2-D | all word problems, ratio (C5) | C3 Ch4–5, 7–9 |
| — | **Fact Family House** & **Operation Machine** (step builder) | kit-operations | 2-D | all classes | C3 Ch4, 7 |
| T8 | **Fraction Kit** — cut/fold shapes, bars, wall, ribbon, set model, add/subtract | kit-fraction | 2-D · 2.5-D food | unit → equivalent → unlike denominators, decimals (C4–5) | C3 Ch9 |
| T9 | **Money Mat & Shop** — BDT notes/coins (stylised, not replicas), exchange, shop, change | kit-money | 2-D · 2.5-D shop | coins → large amounts, profit/loss (C5) | C3 Ch10, 8 |
| T10 | **Ruler, Tape & Map** — magnifier ruler, unit ladder, map distances | kit-measure | 2-D | cm → km, area/perimeter (C4–5) | C3 Ch11 |
| T11 | **Balance & Scales** — balance with weights, dial/digital scales, capacity jugs | kit-measure | 2-D · **3-D balance with physics** | g/kg → litres | C3 Ch11 |
| T12 | **Clock Workshop** — geared analogue + digital, day sky, elapsed time, calendar | kit-measure | 2-D · 3-D clock | hours → minutes → 24-h, calendar | C3 Ch11 |
| T13 | **Geo Board** — dot paper, angle tester and maker, shape classifier, robot walk | kit-geometry | 2-D | points/lines → angles → polygons, perimeter | C3 Ch12 |
| — | **Solids Viewer** — rotate 3-D solids, find faces/edges/corners, flat vs curved, nets | kit-geometry | **3-D** (2-D fallback: image turntable) | C1–C5 solids | C3 Ch12 |
| T15 | **Data Studio** — tally, tables, pictographs with a key, bar charts later | kit-data | 2-D | pictographs → bar/line charts, averages (C5) | C3 Ch13 |

Future subject kits follow the same shape (e.g. `kit-bangla` for letter tracing and word building, `kit-science` for simulations).

## Toy contract
```ts
interface ToyDefinition<State, Config> {
  id: string;                         // 'operations/plates-and-packs'
  kit: string;
  configSchema: ZodSchema<Config>;    // validates lesson JSON
  init(config: Config): State;
  reducer(state: State, action: ToyAction): State;   // pure; enables undo/replay
  renderers: {
    '2d': React.FC<ToyViewProps<State>>;              // required
    '2.5d'?: React.FC<ToyViewProps<State>>;           // optional, lazy
    '3d'?: React.FC<ToyViewProps<State>>;             // optional, lazy, WebGL only
  };
  controls?: React.FC<ToyViewProps<State>>;          // buttons + status under the stage
  toEquation?(state: State, lang: Lang): EquationChip[];
  explain?(state: State, lang: Lang): EqLine[];       // "math language" lines + comments
  check?(state: State, expect: unknown): Feedback;    // for Try steps and lab challenges
  parts?(state: State, lang: Lang): ToyPart[];        // callouts: title, note, knobs → actions
  autoplay?(state: State): ToyAction | null;          // ▶ play: next step, null when done
  clear?: ToyAction;                                  // restart but keep knob changes
  tips?: I18n[];                                      // "what you can do" list
  thumbnail?: React.FC<{ config: Config }>;           // lesson-card picture
  generators?: PracticeTemplate[];                    // shared practice templates
  misconceptions?: Misconception[];
}
```
Renderers mark where each part is with `SvgAnchor` (2-D) or `Anchor3D` (2.5-D/3-D) from `@khelaghor/stage`; the shell draws the callouts there, so callouts work the same in every view.

A toy may ship several renderers, but each lesson scene picks one with `view` (default `'2d'`); the shell never offers a switch between them (decision D17).

A lesson only references `toy`, `config`, `view`, `steps`, `lab` and `practice` (see [05-tech-stack.md](05-tech-stack.md#content-model)).

## Rules for what goes where
| Question | Put it in |
|---|---|
| Could another class or subject use it? | a **kit** or **platform** package |
| Is it a different *setting* of an existing toy? | **content config**, not new code |
| Is it a new kind of interaction needed by only one book? | the book's `content/toys/`. If a second book needs it, promote it to a kit |
| Is it text, glossary, theme, map or stickers? | the **book content** package |
| Is it a fix in a kit? | fix it in the kit; every book benefits |

## Quality bar for shared packages
- Storybook stories for every toy and UI piece, with configs for several classes.
- Unit tests for reducers, generators (property tests: 10,000 items valid) and the Bangla number words.
- Visual tests on the 2-D renderer; smoke tests on the 3-D renderer.
- A performance budget per toy (see [05-tech-stack.md](05-tech-stack.md#performance-budgets)).
