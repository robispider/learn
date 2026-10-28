import type { CSSProperties } from 'react';
import { Human, type Expression, type Look, type Mouth, type Pose } from './human';
import { Parrot } from './parrot';

/** Looks for the shared cast. Books register their own characters the same way. */
export const LOOKS: Record<string, Look> = {
  rafi: {
    skin: 'medium',
    hair: 'black',
    hairStyle: 'short',
    outfit: 'shirt-shorts',
    top: '#FFFFFF',
    topShade: '#C9D3E3',
    bottom: '#33405C',
    collar: '#F3F6FA',
  },
  tuli: {
    skin: 'medium',
    hair: 'black',
    hairStyle: 'ponytails',
    outfit: 'dress',
    top: '#2BB3A3',
    topShade: '#1D8579',
    bottom: '#2BB3A3',
    collar: '#FFFFFF',
    tie: '#F7C948',
  },
  // Generic children for crowd scenes (sharing, shops, classrooms).
  kid1: {
    skin: 'tan',
    hair: 'black',
    hairStyle: 'ponytails',
    outfit: 'dress',
    top: '#F4D35E',
    topShade: '#D6B23A',
    bottom: '#F4D35E',
    collar: '#7CC46E',
    tie: '#E85D75',
  },
  kid2: {
    skin: 'medium',
    hair: 'black',
    hairStyle: 'short',
    outfit: 'shirt-shorts',
    top: '#F7B32B',
    topShade: '#D68E12',
    bottom: '#4C5A7A',
  },
  kid3: {
    skin: 'deep',
    hair: 'dark',
    hairStyle: 'ponytails',
    outfit: 'dress',
    top: '#E85D5D',
    topShade: '#C24040',
    bottom: '#E85D5D',
    collar: '#5CB85C',
    tie: '#2B2B40',
  },
  kid4: {
    skin: 'light',
    hair: 'brown',
    hairStyle: 'bob',
    outfit: 'dress',
    top: '#8E7CC3',
    topShade: '#6E5CA3',
    bottom: '#8E7CC3',
    collar: '#FFFFFF',
  },
  kid5: {
    skin: 'tan',
    hair: 'black',
    hairStyle: 'short',
    outfit: 'shirt-shorts',
    top: '#5BC0EB',
    topShade: '#3A9CC8',
    bottom: '#2B3A55',
  },
  kid6: {
    skin: 'medium',
    hair: 'black',
    hairStyle: 'bun',
    outfit: 'dress',
    top: '#FF8FB1',
    topShade: '#E06A90',
    bottom: '#FF8FB1',
    tie: '#2BB3A3',
  },
  kid7: {
    skin: 'deep',
    hair: 'black',
    hairStyle: 'short',
    outfit: 'shirt-shorts',
    top: '#9BD770',
    topShade: '#73B547',
    bottom: '#5A4A3A',
  },
  kid8: {
    skin: 'light',
    hair: 'black',
    hairStyle: 'ponytails',
    outfit: 'dress',
    top: '#FFB347',
    topShade: '#E08F20',
    bottom: '#FFB347',
    collar: '#FFFFFF',
    tie: '#3EC6F0',
  },
};

export const KID_IDS = ['kid1', 'kid2', 'kid3', 'kid4', 'kid5', 'kid6', 'kid7', 'kid8'] as const;

export const POSES: Pose[] = ['idle', 'think', 'point', 'cheer', 'wave', 'sad', 'surprised'];
export const EXPRESSIONS: Expression[] = ['happy', 'curious', 'worried', 'proud'];

export type CharacterProps = {
  id: string;
  pose?: Pose;
  expression?: Expression;
  mouth?: Mouth;
  talking?: boolean;
  lookAt?: [number, number];
};

/** Any cast member as an SVG <g> in figure space (viewBox "-30 0 260 300"). */
export function Character({ id, ...rest }: CharacterProps) {
  if (id === 'tia') return <Parrot pose={rest.pose} expression={rest.expression} talking={rest.talking} />;
  const look = LOOKS[id] ?? LOOKS.kid2!;
  return <Human look={look} {...rest} />;
}

export const FIGURE_VIEWBOX = '-30 0 260 300';

/** A character in its own <svg>, for use in the DOM (dialogue, cards). */
export function CharacterSvg({
  size = 96,
  style,
  title,
  ...props
}: CharacterProps & { size?: number; style?: CSSProperties; title?: string }) {
  return (
    <svg
      viewBox={FIGURE_VIEWBOX}
      width={size * (260 / 300)}
      height={size}
      style={{ overflow: 'visible', flex: 'none', ...style }}
      role="img"
      aria-label={title ?? props.id}
    >
      <Character {...props} />
    </svg>
  );
}

/** Just the head and shoulders, for avatars and speech bubbles. */
export function CharacterHead({ size = 56, ...props }: CharacterProps & { size?: number }) {
  const box = props.id === 'tia' ? '30 40 150 150' : '30 30 140 140';
  return (
    <svg
      viewBox={box}
      width={size}
      height={size}
      style={{ flex: 'none', overflow: 'hidden', borderRadius: '50%' }}
      aria-hidden
    >
      <Character {...props} />
    </svg>
  );
}
