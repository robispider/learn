# 01 · Vision and principles (all books)

## Vision
**খেলাঘর (Khelaghor, "playroom")** is a family of interactive, visual and playful learning apps. Each app is built on one NCTB textbook (one class, one subject). A child opens the chapter they're studying at school, **plays with the idea** using toys on screen, sees the same idea as pictures and then symbols, and practises until they've got it, guided by the book's own characters.

Every book app is named `<শ্রেণি> <বিষয়> খেলাঘর`. The first is **তৃতীয় শ্রেণির গণিত খেলাঘর** (Class 3 Math).

### Why a platform, not one-off apps
Most of the work is shared between books: the app shell, practice engine, voice, art style, and above all the **manipulatives**. Class 3 and Class 4 math both need place value, column methods, fractions, money and clocks, just with bigger numbers and more steps. So we build **reusable packages and kits once**, and each new book is mostly **content + configuration**. See [04-packages-and-kits.md](04-packages-and-kits.md).

### What we want a child to say
- "I *moved* the blocks and the number changed by itself." (concrete)
- "Oh, the picture shows why we carry the 1." (pictorial → abstract)
- "One more round! I want the next sticker." (fun with a purpose)
- "This is exactly what we did in class today." (book-aligned)

## Who it is for
| User | Need |
|---|---|
| **Primary student (Class 1–5, age 6–11)**, Bangla medium, NCTB curriculum | Understand, not memorise. Short sessions. Big touch targets. Reading skill varies, so voice and pictures carry meaning. |
| **Parent** | Find "today's lesson" by chapter or **book page**. See progress. |
| **Teacher** (later) | Show a toy on a projector or TV in class. See what to revise. |

Devices: low-to-mid Android phones and tablets, school laptops and projectors, sometimes offline → **must work offline after the first load**. 3-D must be an enhancement, never a requirement.

## Product principles
1. **Book-aligned, not book-copied.** Same chapters, order, words, characters and activity symbols as the book. Every explanation is re-imagined as an interaction, not a scanned page. All art is redrawn.
2. **Concrete → Pictorial → Abstract (CPA) in every topic.** The child can always step back down a level ("দেখাও", show me).
3. **Manipulate first, explain second.** The child acts first (drag, cut, deal, fold, rotate), then the app names what happened.
4. **Build once, configure many times.** Shared kits cover a range of classes (e.g. the place-value mat works from tens up to কোটি). A lesson is data that configures a toy. Book-specific code is the exception and must justify itself.
5. **Mistakes are part of learning.** Show why an answer is wrong using the same picture. Never just a red ✗.
6. **Fun with a purpose.** Stickers, story maps, mini-games and companions, but every mechanic exercises the actual concept.
7. **Bangla first, English as a toggle.** Bangla digits by default. Book terms exactly as printed.
8. **Short, complete sessions.** Activity ≈ 3–5 min, topic ≈ 10–15 min, always end on success.
9. **Accessible and light.** Cheap phones first; 2-D fallback for every 3-D view; targets ≥ 48 px; audio for all text; reduced motion respected.
10. **Private by default.** No accounts or tracking of children. Progress stays on the device.

## Success looks like
- A child can finish one chapter's Explore → Try → Practice → Challenge path alone.
- Measurable improvement on that chapter's end-of-chapter questions (pre/post check).
- Adding a second book reuses ≥ 70% of the code (kits, shell, practice, voice, art).
- Kids rate it fun and come back.

## Out of scope (for now)
Online multiplayer, chat, ads, payments, accounts, replacing the textbook or the teacher.
