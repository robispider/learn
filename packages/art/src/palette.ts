/** Art palette. Every shape uses base / shade / highlight from here so the style stays consistent. */
export const INK = '#2B2B40';
export const OUTLINE = 2;

export const SKIN = {
  light: { base: '#F2C9A0', shade: '#DDAA80' },
  medium: { base: '#D9A274', shade: '#BF865A' },
  tan: { base: '#B97A4E', shade: '#9C633C' },
  deep: { base: '#8D5634', shade: '#734326' },
} as const;
export type Skin = keyof typeof SKIN;

export const HAIR = { black: '#262330', brown: '#4A3022', dark: '#33251F' } as const;
export type HairColor = keyof typeof HAIR;

export const FOOD = {
  biscuit: { base: '#E8A84C', shade: '#C9832E', hi: '#F7CE84' },
  orange: { base: '#FF9A2E', shade: '#E0761A', hi: '#FFC77A' },
  lemon: { base: '#F7DC3E', shade: '#D9B91F', hi: '#FFF09A' },
  chocolate: { base: '#7A4A2E', shade: '#5C3420', hi: '#A26B47' },
  leaf: { base: '#4FAE4A', shade: '#3A8A37' },
} as const;

export const PLATE = { base: '#FFFFFF', rim: '#E4E9F2', shade: '#C7D0E0' };
export const WOOD = { top: '#D99A5B', edge: '#B57540', dark: '#8E5A30', grain: '#C88647' };
