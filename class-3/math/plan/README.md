# তৃতীয় শ্রেণির গণিত খেলাঘর — book plan (Class 3 Math)

This folder holds only what is specific to the **NCTB Class 3 প্রাথমিক গণিত** book. Everything shared (vision, learning design, UI shell, kits, tech stack, art, voice, playbook) is in the **[top-level platform plan](../../../plan/README.md)**.

| Doc | What it covers |
|---|---|
| This README | Book profile: name, source, characters, symbols, map theme, stickers, kits used, gaps |
| [01 · Curriculum map](01-curriculum-map.md) | All ~62 topics → book pages → toy → Explore/Try → Practice → game → phase |
| [02 · Roadmap](02-roadmap.md) | Phase 0 Division slice in detail, then MVP and later phases for this book |
| [../references/](../references/book-overview.md) | Book overview and 13 chapter notes (read from the page images) |

## Book profile
| Field | Value |
|---|---|
| Book id | `c3-math` (package `@khelaghor/book-c3-math`) |
| App name | **তৃতীয় শ্রেণির গণিত খেলাঘর** (English: *Class 3 Math Khelaghor*) |
| Source | NCTB *প্রাথমিক গণিত*, Class 3, first printed 2023, revised 2024, reprint Sep 2025; 162 PDF pages; **book page = PDF page − 6** |
| Audience | Class 3, age 8–9, Bangla medium |
| Language | Bangla default (Bangla digits), English toggle |
| Bangla reviewer | Project owner (via the [review workflow](../../../plan/07-adding-a-book.md#5-bangla-review-workflow)) |

### Characters (redrawn as parametric SVG, see [art](../../../plan/06-art-and-voice.md))
| Character | Role in the book | Role in the app |
|---|---|---|
| **রাফি** (Rafi), boy | Asks "কীভাবে…?", tries a first idea, sometimes wrong | Narrates the story hook; makes the "mistake" children fix |
| **তুলি** (Tuli), girl | Refines the idea, states the method | Guides Try steps |
| **টিয়া** (Tia), green parakeet | Gives definitions; "think of another way" | **Companion**: hints, celebrations, Learn cards |

Speech-box colours as in the book: Rafi yellow, Tuli pink, Tia light blue; rule boxes lavender.

### Mode symbols (from book p.5)
| Book symbol | Book name | App mode |
|---|---|---|
| ❓ speech bubble | মূল প্রশ্ন | Explore |
| ▲ pink triangle | কাজ | Try |
| ■ teal square | অনুশীলন | Practice |
| ● blue circle | নিজে করি | Challenge (chapter end) |

### Story map theme: "গণিতের গ্রাম" (a village along a river)
| Ch. | Place |
|---|---|
| ১ সংখ্যা | সংখ্যার হাট (Number Haat) |
| ২–৪ যোগ/বিয়োগ | যোগ-বিয়োগের ঘাট (river ghat with boats) |
| ৫ গুণ | গুণের বাগান (mango orchard) |
| ৬–৭ ভাগ | ভাগের উঠোন (courtyard with plates) |
| ৮ সমস্যা | বাজার (market) |
| ৯ ভগ্নাংশ | পিঠা ঘর (pitha bakery) |
| ১০ মুদ্রা | টাকার বাজার / ব্যাংক |
| ১১ পরিমাপ | মাপের মেলা (fair) + রেলস্টেশন (time) |
| ১২ জ্যামিতি | জ্যামিতির বাগান |
| ১৩ উপাত্ত | শিশুপার্ক |

Sticker set: everyday Bangladesh (ilish, mango, rickshaw, boat, kite, pitha, doel, shapla, clay bank, train…), one per topic.

### Kits used
| Kit | Toys used by this book |
|---|---|
| kit-number | T1 Place-Value Mat, T3 Number Line, T14 Pattern Studio, Number Cards & Chart |
| kit-operations | T2 Column Machine, T4 Array Garden, T5 Plates & Packs, T6 Area Model, T7 Bar Model, Fact Family House, Operation Machine |
| kit-fraction | T8 Fraction Kit |
| kit-money | T9 Money Mat & Shop |
| kit-measure | T10 Ruler & Map, T11 Balance & Scales, T12 Clock Workshop |
| kit-geometry | T13 Geo Board, Solids Viewer (3-D) |
| kit-data | T15 Data Studio |
| **Book-only** | Number puzzles for 4.3 (magic star / diamond chains); to promote to kit-number if another book needs it |

### Where 2.5-D and 3-D add real value in this book
| Topic | View | Why |
|---|---|---|
| Ch. 1 place value (1,00,000) | 2.5-D/3-D block stacks | Ten flats really *stack* into a 1000-cube |
| Ch. 6 sharing | 2.5-D table with plates | Feels like a real table; deal round by round |
| Ch. 10 money | 2.5-D shop counter | Shop scene for paying and change |
| Ch. 11 weight | 3-D balance with physics | The arm tilts realistically; clay changes shape, not weight |
| Ch. 12 surfaces | 3-D solids viewer | Rotate a can, ball, die: find flat vs curved faces |
Everything also works in 2-D.

### Book-specific vocabulary
The glossary is built from the "Vocabulary" sections of each [chapter note](../references/chapters/), e.g. একক/দশক/শতক/হাজার/অযুত/লক্ষ, বিয়োজন/বিয়োজ্য/বিয়োগফল, গুণ্য/গুণক/গুণফল, ভাজ্য/ভাজক/ভাগফল/ভাগশেষ, লব/হর, সমকোণ/সূক্ষ্মকোণ/স্থূলকোণ/সরল কোণ, চিত্রলেখ. It becomes `content/glossary.json` and is reviewed first.
