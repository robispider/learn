import { defineToy } from '@khelaghor/stage';
import { lazy } from 'react';
import { PlatesControls, describe, toEquation } from './Controls';
import {
  check,
  configSchema,
  expectSchema,
  init,
  reducer,
  type Action,
  type Config,
  type State,
} from './model';
import { autoplay, explain, parts, Thumbnail, tips } from './parts';
import { S } from './strings';
import { PlatesView2D } from './View2D';

/** T5 Plates & Packs: share (প্রত্যেকে কয়টি?) and group (কতজনকে?) with leftovers. */
export const platesAndPacks = defineToy<State, Config, Action>({
  id: 'operations/plates-and-packs',
  kit: 'operations',
  title: S.title,
  configSchema,
  init,
  reducer,
  renderers: {
    '2d': PlatesView2D,
    '2.5d': lazy(() => import('./View25D')),
  },
  controls: PlatesControls,
  toEquation,
  check,
  expectSchema,
  describe,
  parts,
  explain,
  autoplay,
  clear: { type: 'reset' },
  tips,
  thumbnail: Thumbnail,
});

export * from './model';
export { describe, toEquation } from './Controls';
export { ITEM_NAMES, S as platesStrings } from './strings';
export * from './practice';
