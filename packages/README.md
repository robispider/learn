# packages — shared code (`@khelaghor/*`)

Dependencies only point down: book apps → book content → kits → platform. Packages ship TypeScript source; the book app's Vite build compiles them. Design: [plan/04-packages-and-kits.md](../plan/04-packages-and-kits.md).

| Package | What's in it now (Phase 0) |
|---|---|
| `i18n` | Bangla/English digits, Indian grouping, number words with লক্ষ/কোটি, ordinals, `{slot}` filling, `toSpeech()` ("১২ ÷ ৩" → "বারো ভাগ তিন") |
| `core` | Content schema (zod): Book, Chapter, Topic, Step; seeded RNG; mastery and adaptive level rules; settings and progress stores (localStorage with in-memory fallback); Bangla review export helpers |
| `voice` | `voice.speak()` fallback chain: recorded file → pre-generated file → device TTS (only with a Bangla voice) → highlight only; who-is-speaking hook for lip-flap; Web Audio sound effects (no files) |
| `ui` | Design tokens (paper grid, book speech colours, place-value and equation-chip colours, dark mode), Hind Siliguri font, buttons, speech bubble, tabs, numpad, equation chips, choices (ক/খ/গ/ঘ), stars, confetti |
| `art` | Parametric SVG characters (Rafi, Tuli, Tia, 8 generic kids; 7 poses, 4 expressions, talking mouth, blink), items (biscuit, orange, lemon, chocolate + dashed ghost), plate, bag, table, ribbon, stickers; `art/three`: procedural 3-D versions |
| `stage` | Toy contract (`defineToy`), `useToy` (undo/redo), `ToyHost` (lazy 2.5-D/3-D with 2-D fallback), drag / drop / tap-to-place, WebGL + memory + frame-time capability check, iso helper; `stage/three`: orthographic on-demand `ThreeStage`, `Mover`, blob shadows |
| `practice` | Template and misconception registries, answer checking, item picking, `SentenceInput` (fill the boxes in "১৪ ÷ ৪ = [q], অবশিষ্ট [r]") |
| `shell` | The app for any book: story map, chapter page, lesson playground (Explore / Try / Practice / Learn with the book's symbols), game frame, settings with grown-ups gate, review page |
| `kit-operations` | **T5 Plates & Packs** (share / group, leftovers, 2-D + 2.5-D), division practice templates (`div-share-exact`, `div-group-exact`, `div-meaning`, `div-remainder`), 3 misconceptions, **Plate Dealer Rush** game |

Not built yet: `kit-number`, `kit-fraction`, `kit-money`, `kit-measure`, `kit-geometry`, `kit-data` (Phases 1–3).
