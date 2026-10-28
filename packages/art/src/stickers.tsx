import { INK, OUTLINE } from './palette';

/** Reward stickers: everyday Bangladesh, drawn in the same flat style. Each fits a 100×100 box. */
function Frame({ children, bg }: { children: React.ReactNode; bg: string }) {
  return (
    <g>
      <circle cx={50} cy={50} r={47} fill="#fff" stroke={INK} strokeWidth={OUTLINE} />
      <circle cx={50} cy={50} r={41} fill={bg} />
      {children}
    </g>
  );
}

function Mango() {
  return (
    <Frame bg="#FFF1C2">
      <path
        d="M30,58 C26,36 46,22 62,30 C80,38 78,66 60,76 C44,84 33,72 30,58 Z"
        fill="#FFB627"
        stroke={INK}
        strokeWidth={OUTLINE}
      />
      <path
        d="M36,60 C36,48 44,40 52,38"
        stroke="#FFD66B"
        strokeWidth={5}
        fill="none"
        strokeLinecap="round"
      />
      <path d="M58,30 Q60,20 66,16" stroke="#6B4A2B" strokeWidth={3} fill="none" strokeLinecap="round" />
      <path d="M62,22 Q78,12 86,24 Q72,30 62,22 Z" fill="#4FAE4A" stroke={INK} strokeWidth={1.6} />
    </Frame>
  );
}

function Kite() {
  return (
    <Frame bg="#D6F0FF">
      <path
        d="M50,16 L76,46 L50,78 L24,46 Z"
        fill="#E85D75"
        stroke={INK}
        strokeWidth={OUTLINE}
        strokeLinejoin="round"
      />
      <path d="M50,16 L50,78 M24,46 L76,46" stroke={INK} strokeWidth={1.6} />
      <path d="M50,16 L76,46 L50,46 Z" fill="#F7C948" />
      <path d="M50,78 Q44,84 52,88 Q60,92 54,96" stroke={INK} strokeWidth={1.8} fill="none" />
      <path d="M48,86 l-6,-3 l2,6 z M56,93 l6,-2 l-3,6 z" fill="#2BB3A3" stroke={INK} strokeWidth={1} />
    </Frame>
  );
}

function Boat() {
  return (
    <Frame bg="#CDEBF5">
      <path d="M14,70 Q50,80 86,70 L86,76 Q50,88 14,76 Z" fill="#5BA8D6" />
      <path
        d="M18,62 Q50,78 82,62 L74,72 Q50,80 26,72 Z"
        fill="#8A5A34"
        stroke={INK}
        strokeWidth={OUTLINE}
        strokeLinejoin="round"
      />
      <path d="M50,22 L50,66" stroke={INK} strokeWidth={2.5} />
      <path
        d="M52,24 Q74,40 70,60 L52,60 Z"
        fill="#F4D35E"
        stroke={INK}
        strokeWidth={OUTLINE}
        strokeLinejoin="round"
      />
      <path
        d="M48,30 Q34,44 36,60 L48,60 Z"
        fill="#E85D5D"
        stroke={INK}
        strokeWidth={OUTLINE}
        strokeLinejoin="round"
      />
    </Frame>
  );
}

function Shapla() {
  return (
    <Frame bg="#DDF3E4">
      <ellipse cx={50} cy={72} rx={30} ry={8} fill="#4FAE4A" stroke={INK} strokeWidth={1.6} />
      {[-40, -20, 0, 20, 40].map((r) => (
        <path
          key={r}
          d="M50,66 Q40,44 50,26 Q60,44 50,66 Z"
          fill="#F7A1C4"
          stroke={INK}
          strokeWidth={1.6}
          transform={`rotate(${r} 50 66)`}
        />
      ))}
      <circle cx={50} cy={58} r={6} fill="#F7C948" stroke={INK} strokeWidth={1.4} />
    </Frame>
  );
}

const STICKERS: Record<string, () => React.JSX.Element> = {
  mango: Mango,
  kite: Kite,
  boat: Boat,
  shapla: Shapla,
};
export const STICKER_IDS = Object.keys(STICKERS);

export function Sticker({ id, size = 80, locked }: { id: string; size?: number; locked?: boolean }) {
  const S = STICKERS[id] ?? Shapla;
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      aria-hidden
      style={{ flex: 'none', filter: locked ? 'grayscale(1) opacity(0.35)' : undefined }}
    >
      <S />
    </svg>
  );
}
