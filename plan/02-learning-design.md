# 02 · Learning design (all books)

Examples come from Class 3 Math, but the model is the same for every book.

## 1. Structure: Book → Chapter → Topic → Mode

```
Book            e.g. Class 3 Math
 └─ Chapter     e.g. ৬ ভাগ
     └─ Topic   e.g. ৬.৫ ভাগশেষ
         ├─ Explore   story hook + free play with a toy
         ├─ Try       guided steps, hints, character dialogue
         ├─ Practice  generated, adaptive items
         └─ Learn     the rule card + key words + link to the book page
     Chapter end: Challenge (mixed quest) + "make your own" task
```

**Mode symbols are per-book configuration.** NCTB books mark activities with their own icons. In Class 3 Math these are ❓ মূল প্রশ্ন → Explore, ▲ কাজ → Try, ■ অনুশীলন → Practice and ● নিজে করি → Challenge. The shell shows the book's own symbols and names, so kids and teachers recognise them.

## 2. CPA ladder inside every topic
| Level | What the child does | Example (23 × 3) |
|---|---|---|
| **Concrete** | Moves objects (2-D, 2.5-D or 3-D) | Drag 3 rows of (10,10,1,1,1) onto the mat |
| **Pictorial** | Reads or edits a diagram | Place-value chart groups 20×3 and 3×3 light up |
| **Abstract** | Writes symbols or uses the algorithm | Vertical method; carries animate in from the picture |

In Try and Practice, **"দেখাও" (show me)** drops one level down for the current item.

## 3. Interaction patterns (shared vocabulary)
| Pattern | Used for (examples) |
|---|---|
| Drag & drop / snap | blocks, coins, weights, fraction pieces, ordering |
| Deal / distribute | sharing in division, fair shares |
| Bundle / unbundle | place value, carrying, borrowing, money |
| Slider / dial / rotate | number line zoom, arrays, clock hands, angles, 3-D solids |
| Cut / fold | fractions, right angles, symmetry |
| Step-through animation | algorithms, long problems |
| Build the sentence (tiles) | number sentences for word problems |
| Type with on-screen numpad | answers in Bangla or English digits |
| Choose / match / sort | MCQ, matching, sorting |
| Listen (🔊) | every instruction is read aloud |

All of these are implemented once in the shared stage and interaction packages.

## 4. Feedback and hints
- **Immediate, specific feedback** tied to the picture (the wrong column flashes, the leftover wiggles).
- **Hint ladder (3 levels):** guiding question from the companion → show the picture → worked step. Hints never take away stars.
- **Misconception library:** each kit ships common error detectors with matching explanations. A book turns them on per topic. Examples:
  | Kit | Error pattern | Response |
  |---|---|---|
  | operations | 52 − 27 = 35 (smaller from larger digit) | Unbundle a ten |
  | number | "3 হাজার 5" written 35 | Empty columns need ০ |
  | operations | remainder ≥ divisor | Leftovers can still be shared |
  | fraction | 1/4 > 1/2 "because 4 > 2" | Bars side by side |
  | measure | hour and minute hands swapped | Colour-coded hands; hour hand creeps |
  | geometry | longer arms = bigger angle | Arms resize, the angle stays the same |

## 5. Practice engine (shared)
- **Generated items** from templates with constraints (e.g. "3-digit − 3-digit, 1 borrow, no zeros"). Generic templates live in kits; books add their own.
- **Mastery:** 3 in a row without the worked-step hint, or 8 out of 10 → topic ⭐.
- **Adaptive levels:** easy / medium / hard per template. Step down after 2 wrong, up after 3 right.
- **Spaced review:** daily "আজকের ৫টি" pulls items from topics mastered 1, 3 and 7 days ago.
- **Item types:** number entry, MCQ (ক/খ/গ/ঘ), fill the box, match, order, drag-to-build, true/false with a reason.
- Book-style items are kept on purpose, so school tests feel familiar.

## 6. Fun and motivation (shared mechanics, themed per book)
| Mechanic | Shared part | Per-book part |
|---|---|---|
| Story map | Map engine, unlock and progress states | Theme and village names (Class 3 Math: Number Haat, Money Bazar…) |
| Stickers & album | Album, reveal animation | Sticker set (ilish, rickshaw, mango…) |
| Companion | Hint/celebrate behaviour | Character (Class 3 Math: টিয়া the parrot) |
| Mini-games (60–90 s) | Game frame, timer, scoring | Which skill and toy it drills |
| Streak | Soft daily streak, never punishing | — |
| Create mode | Save and share as an image | "Make a story / pattern / pictograph" prompts |
| Celebrations | Confetti, sounds, can be turned off | Character cheers |

No public leaderboards for children.

## 7. Language
- All strings are i18n keys with **bn + en**. Numbers render in Bangla digits when the language is bn.
- **Bangla number words** (২৩৪২৫ → তেইশ হাজার চারশত পঁচিশ) and **Indian grouping** (লক্ষ, কোটি) are shared utilities.
- Each book has a `glossary.json` (bn / en / definition / first chapter) taken from the book's exact terms.
- **The project owner proofreads all Bangla** before release, using the review workflow in [07-adding-a-book.md](07-adding-a-book.md#5-bangla-review-workflow).

## 8. Assessment
- Chapter pre-check (5 items) suggests a starting point. The Challenge is the post-check.
- Progress view for parents and teachers: ⭐ / in progress / not started, plus the most common misconceptions seen.
