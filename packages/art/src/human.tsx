import { motion, useReducedMotion } from 'motion/react';
import { useEffect, useState } from 'react';
import { HAIR, INK, OUTLINE, SKIN, type HairColor, type Skin } from './palette';

export type Pose = 'idle' | 'think' | 'point' | 'cheer' | 'wave' | 'sad' | 'surprised';
export type Expression = 'happy' | 'curious' | 'worried' | 'proud';
export type Mouth = 'smile' | 'open' | 'o' | 'flat' | 'wide';

export type Look = {
  skin: Skin;
  hair: HairColor;
  hairStyle: 'short' | 'ponytails' | 'bun' | 'bob';
  /** 'shirt-shorts' for boys in the book, 'dress' for girls. */
  outfit: 'shirt-shorts' | 'dress' | 'shirt-pants';
  top: string;
  topShade: string;
  bottom: string;
  collar?: string;
  /** Hair-tie colour for ponytails/bun. */
  tie?: string;
};

// Figure space: viewBox -30 0 260 300. Shoulders at y = 152.
const SHOULDER_L: [number, number] = [70, 156];
const SHOULDER_R: [number, number] = [130, 156];
const UPPER = 40;
const FORE = 38;

type ArmPose = {
  hand: [number, number];
  /** which way the elbow bends: 1 = outward/down, -1 = inward/up */ bend: 1 | -1;
};
const POSES: Record<Pose, { l: ArmPose; r: ArmPose; tilt?: number }> = {
  idle: { l: { hand: [58, 228], bend: 1 }, r: { hand: [142, 228], bend: -1 } },
  think: { l: { hand: [56, 228], bend: 1 }, r: { hand: [108, 146], bend: 1 }, tilt: -5 },
  point: { l: { hand: [58, 228], bend: 1 }, r: { hand: [206, 136], bend: -1 } },
  cheer: { l: { hand: [36, 84], bend: -1 }, r: { hand: [164, 84], bend: 1 } },
  wave: { l: { hand: [58, 228], bend: 1 }, r: { hand: [178, 98], bend: -1 } },
  sad: { l: { hand: [80, 232], bend: -1 }, r: { hand: [120, 232], bend: 1 }, tilt: 6 },
  surprised: { l: { hand: [24, 176], bend: 1 }, r: { hand: [176, 176], bend: -1 } },
};

/** Two-bone IK: where the elbow goes so the hand reaches `hand` from `shoulder`. */
function elbowFor(
  shoulder: [number, number],
  hand: [number, number],
  bend: 1 | -1,
): { elbow: [number, number]; hand: [number, number] } {
  const [sx, sy] = shoulder;
  let [hx, hy] = hand;
  let dx = hx - sx;
  let dy = hy - sy;
  let d = Math.hypot(dx, dy);
  const reach = UPPER + FORE - 0.5;
  if (d > reach) {
    hx = sx + (dx / d) * reach;
    hy = sy + (dy / d) * reach;
    dx = hx - sx;
    dy = hy - sy;
    d = reach;
  }
  const a = (UPPER * UPPER - FORE * FORE + d * d) / (2 * d);
  const h = Math.sqrt(Math.max(0, UPPER * UPPER - a * a));
  const ux = dx / d;
  const uy = dy / d;
  const px = sx + a * ux;
  const py = sy + a * uy;
  return { elbow: [px - bend * h * uy, py + bend * h * ux], hand: [hx, hy] };
}

function Arm({
  shoulder,
  pose,
  skin,
  sleeve,
}: {
  shoulder: [number, number];
  pose: ArmPose;
  skin: string;
  sleeve: string;
}) {
  const { elbow, hand } = elbowFor(shoulder, pose.hand, pose.bend);
  const d = `M${shoulder[0]},${shoulder[1]} L${elbow[0]},${elbow[1]} L${hand[0]},${hand[1]}`;
  // Short sleeve covers the first part of the upper arm.
  const sx = shoulder[0] + (elbow[0] - shoulder[0]) * 0.55;
  const sy = shoulder[1] + (elbow[1] - shoulder[1]) * 0.55;
  return (
    <g strokeLinecap="round" strokeLinejoin="round" fill="none">
      <path d={d} stroke={INK} strokeWidth={17 + OUTLINE * 2} />
      <path d={d} stroke={skin} strokeWidth={17} />
      <path d={`M${shoulder[0]},${shoulder[1]} L${sx},${sy}`} stroke={INK} strokeWidth={22 + OUTLINE * 2} />
      <path d={`M${shoulder[0]},${shoulder[1]} L${sx},${sy}`} stroke={sleeve} strokeWidth={22} />
      <circle cx={hand[0]} cy={hand[1]} r={10.5} fill={skin} stroke={INK} strokeWidth={OUTLINE} />
    </g>
  );
}

function useTalkingMouth(talking: boolean, rest: Mouth): Mouth {
  const [m, setM] = useState<Mouth>(rest);
  useEffect(() => {
    if (!talking) {
      setM(rest);
      return;
    }
    const shapes: Mouth[] = ['open', 'smile', 'o', 'wide', 'flat'];
    let i = 0;
    const t = setInterval(() => setM(shapes[i++ % shapes.length]!), 130);
    return () => clearInterval(t);
  }, [talking, rest]);
  return m;
}

function MouthShape({ m }: { m: Mouth }) {
  switch (m) {
    case 'open':
      return (
        <g>
          <path
            d="M86,126 Q100,146 114,126 Z"
            fill="#7A2E2E"
            stroke={INK}
            strokeWidth={OUTLINE}
            strokeLinejoin="round"
          />
          <path d="M92,134 Q100,140 108,134" fill="#F07A7A" />
        </g>
      );
    case 'o':
      return <ellipse cx={100} cy={130} rx={6} ry={7} fill="#7A2E2E" stroke={INK} strokeWidth={OUTLINE} />;
    case 'flat':
      return (
        <path d="M89,129 Q100,131 111,129" stroke={INK} strokeWidth={3} fill="none" strokeLinecap="round" />
      );
    case 'wide':
      return (
        <path
          d="M82,123 Q100,150 118,123 Q100,130 82,123 Z"
          fill="#7A2E2E"
          stroke={INK}
          strokeWidth={OUTLINE}
          strokeLinejoin="round"
        />
      );
    default:
      return (
        <path d="M86,124 Q100,138 114,124" stroke={INK} strokeWidth={3.2} fill="none" strokeLinecap="round" />
      );
  }
}

function Eyes({ expression, look }: { expression: Expression; look: [number, number] }) {
  const reduce = useReducedMotion();
  const [lx, ly] = look;
  if (expression === 'proud') {
    return (
      <g stroke={INK} strokeWidth={3.4} fill="none" strokeLinecap="round">
        <path d="M74,104 Q81,96 88,104" />
        <path d="M112,104 Q119,96 126,104" />
      </g>
    );
  }
  return (
    <motion.g
      style={{ transformOrigin: '100px 103px', transformBox: 'view-box' }}
      animate={reduce ? undefined : { scaleY: [1, 1, 0.1, 1] }}
      transition={{ duration: 4, times: [0, 0.92, 0.96, 1], repeat: Infinity, delay: Math.random() * 2 }}
    >
      <ellipse cx={81 + lx} cy={103 + ly} rx={7} ry={9} fill={INK} />
      <ellipse cx={119 + lx} cy={103 + ly} rx={7} ry={9} fill={INK} />
      <circle cx={83.5 + lx} cy={99.5 + ly} r={2.6} fill="#fff" />
      <circle cx={121.5 + lx} cy={99.5 + ly} r={2.6} fill="#fff" />
    </motion.g>
  );
}

function Brows({ expression, hair }: { expression: Expression; hair: string }) {
  const p = {
    happy: ['M71,86 Q80,81 89,86', 'M111,86 Q120,81 129,86'],
    curious: ['M71,84 Q80,77 89,83', 'M111,88 Q120,86 129,88'],
    worried: ['M72,84 Q81,85 89,90', 'M111,90 Q119,85 128,84'],
    proud: ['M71,84 Q80,79 89,84', 'M111,84 Q120,79 129,84'],
  }[expression];
  return (
    <g stroke={hair} strokeWidth={3.6} fill="none" strokeLinecap="round">
      <path d={p[0]} />
      <path d={p[1]} />
    </g>
  );
}

function HairBack({ look }: { look: Look }) {
  const c = HAIR[look.hair];
  const tie = look.tie ?? '#F2C230';
  if (look.hairStyle === 'ponytails') {
    return (
      <g stroke={INK} strokeWidth={OUTLINE} strokeLinejoin="round">
        <path d="M46,96 C24,104 22,150 34,170 C40,150 44,132 54,116 Z" fill={c} />
        <path d="M154,96 C176,104 178,150 166,170 C160,150 156,132 146,116 Z" fill={c} />
        <circle cx={50} cy={100} r={6} fill={tie} />
        <circle cx={150} cy={100} r={6} fill={tie} />
      </g>
    );
  }
  if (look.hairStyle === 'bob') {
    return (
      <path
        d="M44,90 C40,140 52,150 64,148 L136,148 C148,150 160,140 156,90 Z"
        fill={c}
        stroke={INK}
        strokeWidth={OUTLINE}
      />
    );
  }
  if (look.hairStyle === 'bun') {
    return (
      <g stroke={INK} strokeWidth={OUTLINE}>
        <circle cx={100} cy={34} r={18} fill={c} />
        <rect x={90} y={46} width={20} height={6} rx={3} fill={tie} />
      </g>
    );
  }
  return null;
}

function HairFront({ look }: { look: Look }) {
  const c = HAIR[look.hair];
  if (look.hairStyle === 'short') {
    return (
      <path
        d="M46,96 C42,56 70,38 100,38 C134,38 160,58 154,98 C150,84 146,78 140,74 C128,82 112,76 104,68 C96,80 78,84 64,78 C56,82 50,88 46,96 Z"
        fill={c}
        stroke={INK}
        strokeWidth={OUTLINE}
        strokeLinejoin="round"
      />
    );
  }
  return (
    <path
      d="M45,100 C40,58 68,38 100,38 C132,38 160,58 155,100 C150,82 140,70 126,66 C116,74 106,72 100,62 C94,72 80,76 70,68 C58,74 50,86 45,100 Z"
      fill={c}
      stroke={INK}
      strokeWidth={OUTLINE}
      strokeLinejoin="round"
    />
  );
}

function Body({ look, skin }: { look: Look; skin: { base: string; shade: string } }) {
  const legs = (
    <g stroke={INK} strokeWidth={OUTLINE} strokeLinejoin="round">
      <rect x={78} y={226} width={17} height={56} rx={8} fill={skin.base} />
      <rect x={105} y={226} width={17} height={56} rx={8} fill={skin.base} />
      <path d="M70,282 Q70,270 86,272 L96,272 L96,288 L74,288 Q70,288 70,282 Z" fill="#3A3A55" />
      <path d="M130,282 Q130,270 114,272 L104,272 L104,288 L126,288 Q130,288 130,282 Z" fill="#3A3A55" />
    </g>
  );
  if (look.outfit === 'dress') {
    return (
      <g>
        {legs}
        <path
          d="M72,150 Q100,140 128,150 L134,200 L150,246 Q100,258 50,246 L66,200 Z"
          fill={look.top}
          stroke={INK}
          strokeWidth={OUTLINE}
          strokeLinejoin="round"
        />
        <path d="M66,200 L134,200 L150,246 Q100,258 50,246 Z" fill={look.topShade} opacity={0.55} />
        <path
          d="M84,146 Q100,162 116,146 Q108,156 100,156 Q92,156 84,146 Z"
          fill={look.collar ?? '#FFFFFF'}
          stroke={INK}
          strokeWidth={OUTLINE}
        />
      </g>
    );
  }
  return (
    <g>
      {legs}
      {look.outfit === 'shirt-pants' ? (
        <path
          d="M74,212 L126,212 L124,282 L104,282 L100,240 L96,282 L76,282 Z"
          fill={look.bottom}
          stroke={INK}
          strokeWidth={OUTLINE}
          strokeLinejoin="round"
        />
      ) : (
        <path
          d="M72,210 L128,210 L130,248 L104,248 L100,232 L96,248 L70,248 Z"
          fill={look.bottom}
          stroke={INK}
          strokeWidth={OUTLINE}
          strokeLinejoin="round"
        />
      )}
      <path
        d="M70,152 Q100,142 130,152 L134,218 Q100,226 66,218 Z"
        fill={look.top}
        stroke={INK}
        strokeWidth={OUTLINE}
        strokeLinejoin="round"
      />
      <path d="M100,152 L100,218" stroke={look.topShade} strokeWidth={2.5} />
      {[170, 186, 202].map((y) => (
        <circle key={y} cx={100} cy={y} r={2.2} fill={look.topShade} />
      ))}
      <path
        d="M86,146 L100,162 L114,146 Q100,152 86,146 Z"
        fill={look.collar ?? '#FFFFFF'}
        stroke={INK}
        strokeWidth={OUTLINE}
      />
    </g>
  );
}

export type HumanProps = {
  look: Look;
  pose?: Pose;
  expression?: Expression;
  /** Overrides the mouth; when `talking` it flaps. */
  mouth?: Mouth;
  talking?: boolean;
  /** Pupils shift toward this direction, each in [-1, 1]. */
  lookAt?: [number, number];
};

/** A child figure drawn from parts. Renders a <g> in figure space (viewBox "-30 0 260 300"). */
export function Human({
  look,
  pose = 'idle',
  expression = 'happy',
  mouth,
  talking = false,
  lookAt = [0, 0],
}: HumanProps) {
  const reduce = useReducedMotion();
  const skin = SKIN[look.skin];
  const restMouth: Mouth =
    mouth ??
    (pose === 'surprised'
      ? 'o'
      : pose === 'cheer' || expression === 'proud'
        ? 'wide'
        : expression === 'worried'
          ? 'flat'
          : 'smile');
  const m = useTalkingMouth(talking, restMouth);
  const p = POSES[pose];
  const expr: Expression =
    pose === 'sad' ? 'worried' : pose === 'think' && expression === 'happy' ? 'curious' : expression;
  const look2: [number, number] = [lookAt[0] * 3, lookAt[1] * 2];
  return (
    <motion.g
      animate={reduce ? undefined : pose === 'cheer' ? { y: [0, -10, 0] } : { y: [0, -1.5, 0] }}
      transition={{ duration: pose === 'cheer' ? 0.6 : 2.8, repeat: Infinity, ease: 'easeInOut' }}
    >
      <ellipse cx={100} cy={290} rx={46} ry={7} fill="rgba(43,43,64,0.15)" />
      <Body look={look} skin={skin} />
      <Arm shoulder={SHOULDER_L} pose={p.l} skin={skin.base} sleeve={look.top} />
      {pose === 'think' ? null : pose === 'wave' ? (
        <motion.g
          style={{ transformOrigin: `${SHOULDER_R[0]}px ${SHOULDER_R[1]}px`, transformBox: 'view-box' }}
          animate={reduce ? undefined : { rotate: [0, -12, 0, -12, 0] }}
          transition={{ duration: 1.4, repeat: Infinity }}
        >
          <Arm shoulder={SHOULDER_R} pose={p.r} skin={skin.base} sleeve={look.top} />
        </motion.g>
      ) : (
        <Arm shoulder={SHOULDER_R} pose={p.r} skin={skin.base} sleeve={look.top} />
      )}
      <g transform={`rotate(${p.tilt ?? 0} 100 140)`}>
        <HairBack look={look} />
        <rect x={90} y={128} width={20} height={22} fill={skin.shade} stroke={INK} strokeWidth={OUTLINE} />
        <circle cx={47} cy={104} r={10} fill={skin.base} stroke={INK} strokeWidth={OUTLINE} />
        <circle cx={153} cy={104} r={10} fill={skin.base} stroke={INK} strokeWidth={OUTLINE} />
        <ellipse cx={100} cy={98} rx={54} ry={50} fill={skin.base} stroke={INK} strokeWidth={OUTLINE} />
        <path
          d="M58,118 Q100,152 142,118 Q130,146 100,148 Q70,146 58,118 Z"
          fill={skin.shade}
          opacity={0.35}
        />
        <circle cx={68} cy={120} r={8} fill="#F28C8C" opacity={0.45} />
        <circle cx={132} cy={120} r={8} fill="#F28C8C" opacity={0.45} />
        <HairFront look={look} />
        <Brows expression={expr} hair={HAIR[look.hair]} />
        <Eyes expression={expr} look={look2} />
        <path
          d="M98,110 Q100,116 103,112"
          stroke={skin.shade}
          strokeWidth={2.5}
          fill="none"
          strokeLinecap="round"
        />
        <MouthShape m={m} />
      </g>
      {pose === 'think' && <Arm shoulder={SHOULDER_R} pose={p.r} skin={skin.base} sleeve={look.top} />}
    </motion.g>
  );
}
