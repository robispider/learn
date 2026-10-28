import { operationsKit } from '@khelaghor/kit-operations';
import { defineBook } from '@khelaghor/shell';
import { bookData, bookStrings } from './data';

/** তৃতীয় শ্রেণির গণিত খেলাঘর: content + the kit toys it uses. */
const book = defineBook({
  data: bookData,
  toys: operationsKit.toys,
  games: operationsKit.games,
  strings: bookStrings,
});

export default book;
export { bookData, bookStrings };
