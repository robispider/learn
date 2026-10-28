import { motion, useReducedMotion } from 'motion/react';
import { INK, OUTLINE } from './palette';
import type { Expression, Pose } from './human';

const G = { base: '#62BF45', shade: '#3F9A35', light: '#A8DF78', wing: '#3A8F35' };

/** টিয়া: a green rose-ringed parakeet with a red beak, on a branch. Same figure space as `Human`. */
export function Parrot({
  pose = 'idle',
  expression = 'happy',
  talking = false,
}: {
  pose?: Pose;
  expression?: Expression;
  talking?: boolean;
}) {
  const reduce = useReducedMotion();
  const headTilt = pose === 'think' ? 14 : pose === 'sad' ? -10 : 0;
  const wingUp = pose === 'cheer' || pose === 'wave';
  const pointing = pose === 'point';
  return (
    <motion.g
      animate={reduce ? undefined : pose === 'cheer' ? { y: [0, -14, 0] } : { y: [0, -2, 0] }}
      transition={{ duration: pose === 'cheer' ? 0.55 : 2.4, repeat: Infinity, ease: 'easeInOut' }}
    >
      {/* branch */}
      <g stroke={INK} strokeWidth={OUTLINE} strokeLinejoin="round">
        <path d="M-10,252 Q100,232 230,246 L230,258 Q100,246 -10,266 Z" fill="#8A5A34" />
        <path d="M30,250 Q20,226 2,224 Q18,240 30,250 Z" fill="#4FAE4A" />
        <path d="M196,248 Q214,228 234,232 Q216,246 196,248 Z" fill="#4FAE4A" />
      </g>
      {/* tail */}
      <path
        d="M118,206 Q150,250 176,300 L160,300 Q134,258 104,214 Z"
        fill={G.shade}
        stroke={INK}
        strokeWidth={OUTLINE}
        strokeLinejoin="round"
      />
      <path
        d="M126,214 Q158,258 192,296 L182,300 Q146,262 116,220 Z"
        fill="#3F7FC0"
        stroke={INK}
        strokeWidth={OUTLINE}
        strokeLinejoin="round"
      />
      {/* feet */}
      <g fill="#9AA0B5" stroke={INK} strokeWidth={OUTLINE}>
        <ellipse cx={98} cy={242} rx={10} ry={6} />
        <ellipse cx={124} cy={240} rx={10} ry={6} />
      </g>
      {/* body */}
      <ellipse
        cx={110}
        cy={172}
        rx={44}
        ry={66}
        transform="rotate(-10 110 172)"
        fill={G.base}
        stroke={INK}
        strokeWidth={OUTLINE}
      />
      <ellipse
        cx={100}
        cy={182}
        rx={26}
        ry={46}
        transform="rotate(-10 100 182)"
        fill={G.light}
        opacity={0.8}
      />
      {/* wing */}
      <motion.g
        style={{ transformOrigin: '128px 140px', transformBox: 'view-box' }}
        animate={reduce ? undefined : wingUp ? { rotate: [-40, -70, -40] } : { rotate: 0 }}
        transition={{ duration: 0.5, repeat: wingUp ? Infinity : 0 }}
      >
        <path
          d="M126,128 Q170,150 158,224 Q140,220 120,196 Q112,162 126,128 Z"
          fill={G.wing}
          stroke={INK}
          strokeWidth={OUTLINE}
          strokeLinejoin="round"
        />
        <path
          d="M132,170 Q146,186 150,210"
          stroke={G.base}
          strokeWidth={3}
          fill="none"
          strokeLinecap="round"
        />
      </motion.g>
      {pointing && (
        <path
          d="M84,150 Q40,140 6,150 Q30,160 20,172 Q50,166 86,172 Z"
          fill={G.wing}
          stroke={INK}
          strokeWidth={OUTLINE}
          strokeLinejoin="round"
        />
      )}
      {/* head */}
      <g transform={`rotate(${headTilt} 100 110)`}>
        <circle cx={98} cy={96} r={42} fill={G.base} stroke={INK} strokeWidth={OUTLINE} />
        <path
          d="M60,118 Q96,150 138,118"
          stroke="#E86A8A"
          strokeWidth={5}
          fill="none"
          strokeLinecap="round"
        />
        <path d="M62,124 Q96,156 136,124" stroke={INK} strokeWidth={3} fill="none" strokeLinecap="round" />
        <ellipse cx={112} cy={80} rx={18} ry={12} fill={G.light} opacity={0.5} />
        {/* eye */}
        {expression === 'proud' ? (
          <path d="M76,88 Q84,80 92,88" stroke={INK} strokeWidth={3.4} fill="none" strokeLinecap="round" />
        ) : (
          <g>
            <circle
              cx={84}
              cy={88}
              r={pose === 'surprised' ? 13 : 11}
              fill="#FFF7D6"
              stroke={INK}
              strokeWidth={OUTLINE}
            />
            <motion.circle
              cx={82}
              cy={89}
              r={6.5}
              fill={INK}
              style={{ transformOrigin: '82px 89px', transformBox: 'view-box' }}
              animate={reduce ? undefined : { scaleY: [1, 1, 0.1, 1] }}
              transition={{ duration: 4.2, times: [0, 0.93, 0.96, 1], repeat: Infinity }}
            />
            <circle cx={84} cy={86} r={2} fill="#fff" />
          </g>
        )}
        {expression === 'worried' && (
          <path d="M72,74 Q82,72 92,78" stroke={INK} strokeWidth={3} fill="none" strokeLinecap="round" />
        )}
        {expression === 'curious' && (
          <path d="M72,72 Q82,66 94,72" stroke={INK} strokeWidth={3} fill="none" strokeLinecap="round" />
        )}
        {/* beak: lower half opens while talking */}
        <motion.path
          d="M64,106 Q60,124 70,128 Q74,118 74,108 Z"
          fill="#A8262B"
          stroke={INK}
          strokeWidth={OUTLINE}
          strokeLinejoin="round"
          style={{ transformOrigin: '70px 106px', transformBox: 'view-box' }}
          animate={talking && !reduce ? { rotate: [0, 18, 0] } : { rotate: pose === 'surprised' ? 14 : 0 }}
          transition={{ duration: 0.25, repeat: talking ? Infinity : 0 }}
        />
        <path
          d="M76,90 Q52,88 46,108 Q48,124 60,126 Q58,112 76,110 Z"
          fill="#E5373A"
          stroke={INK}
          strokeWidth={OUTLINE}
          strokeLinejoin="round"
        />
        <path d="M58,98 Q52,104 52,112" stroke="#FF8A7A" strokeWidth={3} fill="none" strokeLinecap="round" />
      </g>
    </motion.g>
  );
}
