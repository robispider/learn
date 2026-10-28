import { Bag, Item, ITEM_KINDS, Plate, type ItemKind } from '@khelaghor/art';
import { pick, tr, type Lang } from '@khelaghor/i18n';
import type { EqLine, ToyPart } from '@khelaghor/stage';
import { toEquation } from './Controls';
import { LIMITS, summarize, type Action, type Config, type State } from './model';
import { ITEM_NAMES, S } from './strings';

function ItemIcon({ kind }: { kind: ItemKind }) {
  return (
    <svg viewBox="-26 -26 52 52" width={30} height={30} aria-hidden>
      <Item kind={kind} />
    </svg>
  );
}

/** Callouts on the scene and the knobs the child can turn in the lab. */
export function parts(s: State, lang: Lang): ToyPart<Action>[] {
  const item = pick(ITEM_NAMES[s.config.item], lang);
  const share = s.config.mode === 'share';
  const pile: ToyPart<Action> = {
    id: 'pile',
    icon: '🧺',
    title: S.partPile,
    note: { bn: tr(S.partPileNote, 'bn', { item }), en: tr(S.partPileNote, 'en', { item }) },
    knobs: [
      {
        kind: 'number',
        id: 'total',
        label: { bn: tr(S.knobTotal, 'bn', { item }), en: tr(S.knobTotal, 'en', { item }) },
        value: s.total,
        min: LIMITS.total[0],
        max: LIMITS.total[1],
        action: (value) => ({ type: 'setTotal', value }),
      },
      {
        kind: 'choice',
        id: 'item',
        label: S.knobItem,
        value: s.config.item,
        options: ITEM_KINDS.map((k) => ({ value: k, label: ITEM_NAMES[k], icon: <ItemIcon kind={k} /> })),
        action: (value) => ({ type: 'setItem', value: value as ItemKind }),
      },
    ],
  };
  if (share)
    return [
      pile,
      {
        id: 'kids',
        icon: '🧒',
        title: S.partKids,
        note: S.partKidsNote,
        knobs: [
          {
            kind: 'number',
            id: 'plates',
            label: S.knobPlates,
            value: s.plates,
            min: LIMITS.plates[0],
            max: LIMITS.plates[1],
            action: (value) => ({ type: 'setPlates', value }),
          },
        ],
      },
      { id: 'plate', icon: '🍽️', title: S.partPlate, note: S.partPlateNote },
    ];
  return [
    pile,
    {
      id: 'pack',
      icon: '🛍️',
      title: S.partPack,
      note: S.partPackNote,
      knobs: [
        {
          kind: 'number',
          id: 'size',
          label: S.knobSize,
          value: s.size,
          min: LIMITS.size[0],
          max: LIMITS.size[1],
          action: (value) => ({ type: 'setSize', value }),
        },
      ],
    },
  ];
}

/** The sum as it grows: the sentence, what has happened so far, and the multiplication check at the end. */
export function explain(s: State, lang: Lang): EqLine[] {
  const sum = summarize(s);
  const share = s.config.mode === 'share';
  const divisor = share ? s.plates : s.size;
  const lines: EqLine[] = [{ parts: toEquation(s, lang) }];
  if (!sum.done) {
    const note =
      sum.pile === s.total
        ? tr(S.noteStart, lang)
        : share && !sum.fair
          ? tr(S.noteUnfair, lang)
          : share
            ? tr(S.noteShareProgress, lang, { n: sum.rounds, p: sum.pile })
            : tr(S.noteGroupProgress, lang, { k: sum.quotient, p: sum.pile });
    lines.push({ parts: [], note });
    return lines;
  }
  // divisor × quotient (+ remainder) = dividend
  lines.push({
    parts: [
      { kind: 'num', value: divisor, color: 'divisor' },
      { kind: 'op', value: '×' },
      { kind: 'num', value: sum.quotient, color: 'quotient' },
      ...(sum.remainder
        ? [
            { kind: 'op', value: '+' } as const,
            { kind: 'num', value: sum.remainder, color: 'remainder' } as const,
          ]
        : []),
      { kind: 'op', value: '=' },
      { kind: 'num', value: s.total, color: 'dividend' },
    ],
    note: tr(S.noteCheck, lang),
  });
  if (sum.remainder) {
    lines.push({
      parts: [
        { kind: 'num', value: sum.remainder, color: 'remainder' },
        { kind: 'op', value: '<' },
        { kind: 'num', value: divisor, color: 'divisor' },
      ],
      note: tr(S.noteRule, lang),
    });
  }
  return lines;
}

/** ▶ deals one round (or packs one pack) at a time until nothing more can be shared. */
export function autoplay(s: State): Action | null {
  const sum = summarize(s);
  if (sum.done) return null;
  if (s.config.mode === 'share') {
    if (!sum.fair) {
      // Even the plates out first, one item at a time.
      const low = sum.counts.indexOf(Math.min(...sum.counts));
      return sum.pile ? { type: 'giveOne', to: low } : null;
    }
    return sum.pile >= s.plates ? { type: 'deal' } : null;
  }
  const open = sum.counts.findIndex((c) => c < s.size);
  const need = s.size - (open >= 0 ? sum.counts[open]! : 0);
  return sum.pile >= need ? { type: 'pack' } : null;
}

export const tips = [S.tipTap, S.tipDrag, S.tipPlay];

/** Lesson-card picture: a plate (or pack) with a few of the items. */
export function Thumbnail({ config }: { config: Config }) {
  const share = config.mode === 'share';
  return (
    <svg viewBox="-70 -52 140 94" width="100%" height="100%" aria-hidden>
      {share ? <Plate w={124} /> : <Bag w={70} h={66} />}
      {[-26, 0, 26].map((x, i) => (
        <g key={i} transform={`translate(${x}, ${share ? -8 - (i === 1 ? 8 : 0) : -40}) scale(0.62)`}>
          <Item kind={config.item} />
        </g>
      ))}
    </svg>
  );
}
