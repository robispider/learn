// Plain data only (no React, no CSS), so build tools can import it for the Bangla review export.
import { RUSH_STRINGS } from './games/strings';
import { T } from './plates-and-packs/practice';
import { ITEM_NAMES, S } from './plates-and-packs/strings';

export const kitStrings = { platesAndPacks: S, items: ITEM_NAMES, practice: T, rush: RUSH_STRINGS };
