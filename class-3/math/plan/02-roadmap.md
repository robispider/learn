# 02 · Roadmap — তৃতীয় শ্রেণির গণিত খেলাঘর

How this book moves through the [platform roadmap](../../../plan/08-roadmap.md).

## Phase 0 — Division slice (Ch. 6: 6.1, 6.2, 6.5)
Goal: prove the look, the lesson loop and the 2-D/2.5-D stage on one chapter before scaling.

### Topic scripts (draft — owner to review Bangla)
**6.1 Sharing — প্রত্যেকে কয়টি করে পাবে?** (book p.63–65)
- *Explore:* Rafi: "১২টি বিস্কুট আছে, ৩ জন বন্ধু। প্রত্যেকে কয়টি করে পাবে?" A table with a biscuit pile and 3 plates (2.5-D). The child taps **"একবার করে দাও"** (deal one round); biscuits fly one to each plate; dashed ghosts stay in the pile. The chips update live: `১২ ÷ ৩ = ?`.
- *Try:* (1) deal until the pile is empty; (2) Tuli: "প্রত্যেকে ৪টি করে পেল" → fill `১২ ÷ ৩ = ৪` with labels বস্তু / শিশু / প্রত্যেকের ভাগ; (3) oranges 6 ÷ 3 and 3 ÷ 3; (4) Tia's question: 0 ÷ 3?
- *Practice:* template `div-share-exact` — items ≤ 9 × 9, picture first, then the number sentence only at the hard level.

**6.2 Grouping — কতজনকে দেওয়া যাবে?** (book p.66–68)
- *Explore:* 12 biscuits, 3 per child: a **packing** animation — children walk up and each takes a pack of 3.
- *Try:* count the children; compare with 6.1 using the same numbers side by side (Tia: "আগের ভাগের সাথে কী পার্থক্য?").
- *Practice:* `div-group-exact`; mixed share/group word problems where the child picks the meaning.

**6.5 Remainder — ভাগশেষ** (book p.73–74)
- *Explore:* Reza's 14 lemons for 4 friends; deal rounds; 2 left in the pile glow and wiggle.
- *Try:* (1) 14 ÷ 4 = ৩, ভাগশেষ ২ with chips ভাজ্য / ভাজক / ভাগফল / ভাগশেষ; (2) **Rafi's mistake**: 19 ÷ 3 = 5, ভাগশেষ 4 → the child taps "আরও ভাগ করা যায়?" and deals one more round → 6, ভাগশেষ 1; rule card: **ভাগশেষ < ভাজক**; (3) ribbon 30 cm cut into 4 cm pieces.
- *Practice:* `div-remainder` with the misconception `remainder-not-less-than-divisor`.
- *Mini-game:* **Plate Dealer Rush** (60 s: how many fair shares can you finish?).

### Deliverables
- Parametric art: Rafi, Tuli, Tia (4 poses), biscuit, orange, lemon, plate, table, ribbon.
- T5 Plates & Packs: 2-D + 2.5-D renderers, share/group modes, leftovers, chips, checks.
- Lesson playground, practice screen, settings, device TTS.
- Glossary v0 for Ch. 6 and all strings of the slice → review export.

### Built (2026-10-28)
- [x] 6.1, 6.2, 6.5: Explore, Try, Practice and Learn, in [`content/src/chapters/ch06.json`](../content/src/chapters/ch06.json)
- [x] T5 Plates & Packs, 2-D + 2.5-D; Plate Dealer Rush game (60 s)
- [x] Rafi, Tuli, Tia + 8 kids; biscuit, orange, lemon, chocolate, plate, bag, table, ribbon; 4 stickers
- [x] Glossary v0 (8 words) and the review file [`review/c3-math-strings.md`](../review/c3-math-strings.md)
- [ ] 6.5 ribbon step (30 cm into 4 cm pieces): needs a small ruler toy; replaced for now by "১৭ ÷ ৫: which is right?"
- [ ] Owner review: art direction, Bangla, terms (see [decisions](../../../plan/decisions.md) D13)
- [ ] Low-end Android phone test of the 2.5-D view

### Exit criteria
- 3–5 children complete the slice alone; most say it's fun.
- The owner approves the art direction, the Bangla text and the terms.
- The 2.5-D table runs smoothly on a low-end Android phone, or falls back to 2-D cleanly.

## Phase 1 — MVP: Ch. 1–8
Order (toy-driven, then filling in topics):
1. **Ch. 6 rest** (6.3, 6.4, 6.6) + **Ch. 7**: reuse T5, add Number Chart, Fact Family, Operation Machine, T7.
2. **Ch. 1**: T1 Place-Value Mat (2-D + 2.5-D blocks), T3 Number Line, Pattern Studio, ordinals.
3. **Ch. 2–4**: T2 Column Machine linked to T1; T7 Bar Model.
4. **Ch. 5.1–5.6**: T4 Array Garden, chart, T2 multiplication mode.
5. **Ch. 8**: word problems with T7 + Story Maker.
Then: full map, stickers, Challenges for Ch. 1–8, pre-generated TTS, pilot.

## Phase 2 — Ch. 5.7–5.9, 9, 10
T6 Area Model, T8 Fraction Kit, T9 Money Mat & Shop (2.5-D shop).

## Phase 3 — Ch. 11, 12, 13 → book complete
T10, T11 (3-D balance), T12, T13 + Solids Viewer (3-D), T15. Teacher/projector mode, printable worksheets.

## Bangla review checkpoints (owner)
| When | What |
|---|---|
| Start of each phase | Glossary for the chapters in that phase |
| Before each release | All new strings (`review:export`) |
| After the pilot | Wording children found hard (from session notes) |
