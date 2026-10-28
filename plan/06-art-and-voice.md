# 06 · Art and voice

Decisions: **no illustrator, so the art is generated in code** (by the developer with AI help), and **text-to-speech is used for voice for now**.

## Art: generated, code-first
All art lives in `@khelaghor/art` (shared) or a book's `content/art/` (book-specific), as **React SVG components**, not image files. This means art can be animated, themed, recoloured and resized, and it stays tiny.

### Style guide
- Flat shapes, 2–3 tones per colour (base, shade, highlight), soft drop shadow, rounded corners, 2 px dark-ink outline (`#2B2B40`) on characters and objects only.
- Palette from `@khelaghor/ui` tokens; books override accents only.
- Same light direction (top-left) in 2-D, iso and 3-D.
- Proportions: characters about 4 heads tall (friendly, readable on small screens).
- No copying of book illustrations, photos or real banknote designs. Currency is **stylised** (colour, value and a simple motif), clearly not a replica.

### Characters (parametric)
```tsx
<Character id="rafi" pose="point" expression="happy" mouth={talking ? 'open' : 'smile'} lookAt={[x, y]} />
```
- **Parts:** head, hair, eyes (blink), eyebrows, mouth (5 shapes for lip-flap while TTS speaks), torso, arms (pose presets), legs.
- **Poses:** idle, think (hand on chin), point, cheer, wave, sad, surprised.
- **Expressions:** happy, curious, worried, proud.
- Class 3 Math cast: **রাফি** (boy, white shirt, dark shorts), **তুলি** (girl, teal dress, two ponytails), **টিয়া** (green parakeet companion with a red beak). They follow the book's descriptions but are redrawn in our style.
- Other books register their own characters with the same part system. Shared generic kids and adults are available for crowd scenes (sharing, shops, classrooms).

### Object library (shared)
Food (biscuit, orange, mango, banana, lychee, roti, watermelon, pitha), table items (plate, basket, bag, box), school items (pencil, khata, ruler, eraser), money (stylised notes, coins), measuring tools (ruler, balance, weights, clock), nature and village (tree, house, river boat, rickshaw), place-value pieces. Each object has `2d` and, where useful, `iso` variants; 3-D versions are procedural meshes (boxes, cylinders, lathe shapes), with no downloaded models.

### Process
1. Draft each character and object as SVG in Storybook, with a **review page** showing every pose at phone size.
2. The owner reviews and gives feedback; we iterate.
3. Lock version 1 of the style before Phase 1 content production.

## Voice: text-to-speech now, recorded voice later
`@khelaghor/voice` exposes one call, `speak(key)`, and picks the best source available:

| Priority | Source | Notes |
|---|---|---|
| 1 | Recorded human voice file | Future: drop files into `content/voice/bn/<key>.mp3` |
| 2 | **Pre-generated TTS file** | Generated at build time by `tooling/tts` with a good Bangla neural voice from a cloud TTS service; works **offline** and sounds the same on every device |
| 3 | Device TTS (Web Speech API, `bn-BD` / `bn-IN`) | Free and instant, but voice quality and availability vary by device; good for prototyping |
| 4 | Visual only | Highlight the words while reading if no voice is available |

- Phase 0 uses the **device TTS** (no cost, no keys); in Phase 1 we compare 2–3 cloud Bangla voices and pre-generate files. The service choice is a later decision.
- Text for speech can differ from display text (e.g. "৫ × ৩" is spoken as "পাঁচ গুণ তিন"). The `@khelaghor/i18n` number-words helper produces the spoken form.
- Mouth shapes on characters animate while audio plays.
- Settings: voice on/off, speed (slow / normal), sound effects on/off, music on/off.
