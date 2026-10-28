import { registerMisconceptions, registerTemplates } from '@khelaghor/practice';
import { plateDealerRush } from './games/PlateDealerRush';
import { misconceptions, platesAndPacks, templates } from './plates-and-packs';
import { kitStrings } from './strings';

export * from './plates-and-packs';
export { plateDealerRush } from './games/PlateDealerRush';
export { kitStrings } from './strings';

/** The operations kit: its toys, practice templates, misconceptions and games, ready to hand to a book. */
export const operationsKit = {
  id: 'operations',
  toys: [platesAndPacks],
  templates,
  misconceptions,
  games: [plateDealerRush],
  /** Every string the kit can show, for the Bangla review file. */
  strings: kitStrings,
};

registerTemplates(templates);
registerMisconceptions(misconceptions);
