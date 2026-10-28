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

### 3. Lesson workbench (core screen)
Modelled on the inspiration sites' workbench: one screen per lesson, nothing scrolls on a laptop. Built in `packages/shell/src/workbench/`.
```
┌──┬──────────────────────────────────────────────────────────────────────────┐
│🗺│ 🏡 তৃতীয় শ্রেণির গণিত খেলাঘর          [🍪 অধ্যায় ৬ · ভাগ ▓▓░ ★২/৯]  ★ ৫   │
│📚├────────────────────────────────────────────┬─────────────────────────────┤
│🎮│ ┌ STAGE ─────────────────────────────────┐ │ ❓মূল প্রশ্ন ▲কাজ 🎛️বদলে দেখি │
│⚙ │ │┌──────┐ ✏️ [১৪]÷[৪]=[৩]  [▶ চালাও]       │ │ 📘শিখি ■অনুশীলন ▶চালাও      │
│  │ ││বিস্কুট │                                │ ├─────────────────────────────┤
│  │ ││− ১৪ +│  🏷 স্তূপ ┆   🏷 শিশুরা ┆          │ │ the mode's panel (only the  │
│  │ ││🍪🍊🍋 │      ●  🍊🍊   ● 🍽 🍽 🍽 🍽     │ │ lesson), or the ▶ চালাও tab: │
│  │ ││শিশু   │                                │ │ every math line, numbered,  │
│  │ ││− ৪ + │                                │ │ ▶/⏸ · এক ধাপ · ↺            │
│🔊│ ││⟲⟳↺🏷💡│ (প্রত্যেকে ৩টি, ২টি অবশিষ্ট) [🤲 দাও] │ │                             │
│EN│ └────────────────────────────────────────┘ │                             │
│  ├────────────────────────────────────────────┴─────────────────────────────┤
│  │ পাঠ  📚 অধ্যায় ৬ · ভাগ ▾   ‹ [🍽 ৬.১ …] [🛍 ৬.২ …] [🔒 ৬.৩ …] [🍊 ৬.৫ …] › │
└──┴──────────────────────────────────────────────────────────────────────────┘
```
- **Change chapter / lesson** from anywhere: the chapter card in the header or 📚 opens a drawer with all 13 chapters and their lessons (unbuilt ones locked); the bottom **lesson strip** lists this chapter's lessons as picture cards with stars.
- **Rail** (left; a bottom bar on phones): map, chapters, game, settings, voice, language. It expands to show labels.
- **Stage = everything about the simulation**, so the side panel never repeats it: the toy on grid paper; a small **run pill** at the top (step caption, the live number sentence and **▶ চালাও**, which plays the idea step by step and opens the ▶ চালাও tab; the scene starts below it, so it never covers the toy); the toy's **status and action button** at the bottom; the **rail** on the left edge: the toy's **knobs** (− value + for numbers, picture tiles for picks such as which item to share) and under them the tools (undo · redo · restart · labels · 💡 hint). Knobs work in the lab; elsewhere they show the values, locked, with a "বদলে দেখি" button, and they lock while ▶ plays.
- **▶ চালাও tab** (after the mode tabs, only while the stage has math to show): the full "গণিতের ভাষায়" panel: every line numbered (the live sentence, a running comment, and once done the multiplication check ৪ × ৩ + ২ = ১৪ and the rule ভাগশেষ < ভাজক), the newest highlighted, with ▶/⏸ · এক ধাপ · ↺. It does not change the mode; tapping the mode's own tab goes back to its panel.
- **Callouts**: each toy part (pile, children, plate…) has a pulsing dot and a name tag with a dashed leader line; tapping it opens an **inspector card** with a spoken note and, in the lab, its **knobs**.
- **One view per scene.** The lesson content picks 2-D, 2.5-D or 3-D for each scene by learning need (`view` on a toy block, default 2-D); there is no 2D/2.5D switch. In Ch. 6 the story scenes (Explore) use the 2.5-D table to make the problem feel real; counting work (Try, Lab, Learn, Practice) uses 2-D with count badges. Weak devices, or "2-D only" in settings, fall back to 2-D.
- **Side panel = only the lesson**: the dialogue, the current step, answer boxes and choices, hints, the lab's challenge ladder, the rule. No repeated question card, no tip lists (💡 cycles the toy's tips).
- **Side panel tabs = modes**: ❓ Explore → ▲ Try → 🎛️ Experiment (lab) → 📘 Learn → ■ Practice (check understanding), then ▶ চালাও. Each "next" button leads to the following mode.
- **Practice puts the question on the stage** (a question card over its picture, or alone in the middle); the panel keeps only the progress dots, the answer (number pad or choices), feedback and hints, and the next button. Later some items will be answered on the stage itself (dragging items onto plates); the panel then shows only the status, check and navigation.
- Phones: everything stacks (header, run pill, stage, the rail as a row of knobs and tools under it, status and action button, tabs, panel, strip); name tags start hidden (dots only).

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
