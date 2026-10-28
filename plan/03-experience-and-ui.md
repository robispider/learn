# 03 · Experience and UI (shared shell)

Inspiration: [Learn Arduino](https://learn-arduino-red.vercel.app/) and [Learn ESP32](https://learn-esp32.vercel.app/). We take the pattern, not their code or art:
- warm **paper-grid background** and a big illustrated **centre stage** with **labelled hotspots**
- a small **toolbar** under the stage (undo/redo, zoom, rotate, info, 2-D ↔ 3-D)
- a horizontal **lesson strip** of illustrated cards
- **tabs** under the stage
- a **progress chip** at the top and a friendly loading screen ("Drawing the lessons… 4/16")
- a **bottom navigation bar** with a language switch

What we add for children: characters, voice, bigger targets, a story map, celebrations, Bangla-first type.

All screens below are provided by the shared **`@khelaghor/shell`** package. A book supplies only its theme, characters, map and content.

## Screens

### 1. Home / story map
- Illustrated map, one place per chapter (themed per book). Every chapter is open (kids follow the school's order). "আজকের পাঠ" (today's lesson) is highlighted.
- Top bar: book name · progress chip (⭐ 23/120) · 🔊 · বাংলা/EN.
- "আজকের ৫টি" daily review button.
- **Search by book page** ("বইয়ের পৃষ্ঠা ৭৩") → jumps to that topic.

### 2. Chapter page
- Title and book pages, topic cards in book order with ⭐ state and the book's mode symbols, the Challenge at the end, and the sticker page.

### 3. Lesson playground (core screen)
```
┌────────────────────────────────────────────────────────────┐
│ ← ৬ ভাগ › ৬.৫ ভাগশেষ             ⭐ 2/3   🔊   বাংলা|EN      │
├────────────────────────────────────────────────────────────┤
│ [Rafi bubble 🔊] রেজার কাছে ১৪টি কমলালেবু…                    │
│        ┌──────────── STAGE ─────────────┐                    │
│        │ 2-D SVG · 2.5-D iso · 3-D scene │   [companion]     │
│        │ hotspots · drag · animate       │                    │
│        └─────────────────────────────────┘                    │
│   ⟲ ⟳  − +  ⤾  2D|3D  ⓘ │ দেখাও │ ▶ পরের ধাপ                 │
├────────────────────────────────────────────────────────────┤
│  ❓ Explore   ▲ Try   ■ Practice   📘 Learn                  │
│  [১৪] ÷ [৪] = [৩], ভাগশেষ [২]     ← live equation chips      │
└────────────────────────────────────────────────────────────┘
```
- The **stage** fills most of the screen (landscape on tablets; on phones it stacks with the panel below).
- **Live equation chips** always mirror the toy's state.
- A **2D | 3D toggle** appears only when the toy has a 3-D renderer and the device supports WebGL well. Otherwise the app stays 2-D automatically.
- **Numpad** slides up for answers (big ০–৯, ⌫, ✓).
- The **lesson strip** for the chapter runs along the top or bottom on wide screens.

### 4. Practice / Challenge
One item at a time, progress dots, hint button, "দেখাও", and an end card with stars, a sticker reveal, and "আবার খেলি / পরের পাঠ".

### 5. Album & profiles
Sticker album by chapter, companion wardrobe, streak calendar, several child profiles per device (name + avatar, no login).

### 6. Teacher / projector mode (later)
Big-screen layout showing the toy only, with larger hotspots and keyboard shortcuts.

## Visual style (shared design system `@khelaghor/ui`)
- **Paper & crayon** feel: cream paper-grid background, bright friendly colours, flat SVG with soft shadows.
- **Depth levels:** 2-D flat for diagrams; **2.5-D isometric** for "things on a table" (blocks, plates, shops, maps); **3-D** for solids, rotating objects and spatial ideas. One lighting and colour language across all three.
- **Shared semantic colours**, e.g. the **place-value code** from the NCTB math books: ১০০০০ yellow-green, ১০০০ peach, ১০০ teal, ১০ orange, ১ pink. It is a platform token, so every math book uses it.
- Typography: rounded Bangla font with good conjuncts (candidates: Hind Siliguri, Noto Sans Bengali, Baloo Da 2), ≥ 18 px body on phones, extra-large numerals on the stage.
- Book themes override accent colours, the map art and characters only.
- Light and dark themes.

## Sound
UI sound effects (snap, bundle whoosh, coin clink), an optional soft music loop, and voice for every instruction (see [06-art-and-voice.md](06-art-and-voice.md)).

## Accessibility & comfort
- Targets ≥ 48 px; dragging also works as tap-to-pick, tap-to-place.
- Colour is never the only signal.
- Reduced motion respected; a "slow animations" option.
- Text ≥ 16 px; stage numbers ≥ 20 px.
- Every 3-D toy has a 2-D fallback.
- A gentle break reminder after 20 minutes.
