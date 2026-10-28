import { BookSchema, type BookData, type Chapter, type CharacterRef, type Topic } from '@khelaghor/core';
import type { AnyToy, GameDefinition } from '@khelaghor/stage';
import { createContext, useContext, type ReactNode } from 'react';

/** A book as the shell needs it: validated content plus the toys and games it uses. */
export type Book = {
  data: BookData;
  toys: Record<string, AnyToy>;
  games: Record<string, GameDefinition>;
  /** Kit and book strings to include in the review export. */
  strings: Record<string, unknown>;
};

export function defineBook(input: {
  data: unknown;
  toys: AnyToy[];
  games?: GameDefinition[];
  strings?: Record<string, unknown>;
}): Book {
  const data = BookSchema.parse(input.data);
  return {
    data,
    toys: Object.fromEntries(input.toys.map((t) => [t.id, t])),
    games: Object.fromEntries((input.games ?? []).map((g) => [g.id, g])),
    strings: input.strings ?? {},
  };
}

export type BookApi = Book & {
  topic(id: string): { topic: Topic; chapter: Chapter } | undefined;
  /** All playable topics in book order. */
  topics: { topic: Topic; chapter: Chapter }[];
  character(id: string): CharacterRef | undefined;
  toy(id: string): AnyToy;
  /** Book page → chapter (and topic, if built). */
  findPage(page: number): { chapter?: Chapter; topic?: Topic };
};

const Ctx = createContext<BookApi | null>(null);

export function BookProvider({ book, children }: { book: Book; children: ReactNode }) {
  const topics = book.data.chapters.flatMap((chapter) => chapter.topics.map((topic) => ({ topic, chapter })));
  const api: BookApi = {
    ...book,
    topics,
    topic: (id) => topics.find((t) => t.topic.id === id),
    character: (id) => book.data.characters.find((c) => c.id === id),
    toy: (id) => {
      const t = book.toys[id];
      if (!t) throw new Error(`Toy not registered for this book: ${id}`);
      return t;
    },
    findPage: (page) => {
      const chapter = book.data.chapters.find((c) => page >= c.bookPages[0] && page <= c.bookPages[1]);
      const topic = chapter?.topics.find((t) => page >= t.bookPages[0] && page <= t.bookPages[1]);
      return { chapter, topic };
    },
  };
  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function useBook(): BookApi {
  const b = useContext(Ctx);
  if (!b) throw new Error('useBook outside <Shell>');
  return b;
}
