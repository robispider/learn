import type { Level, Rng } from '@khelaghor/core';
import type { CheckResult, Misconception, PracticeItem, PracticeTemplate, Response } from './types';

const templates = new Map<string, PracticeTemplate>();
const misconceptions = new Map<string, Misconception>();

export function registerTemplates(list: PracticeTemplate[]) {
  for (const t of list) templates.set(t.id, t);
}
export function registerMisconceptions(list: Misconception[]) {
  for (const m of list) misconceptions.set(m.id, m);
}
export function getTemplate(id: string): PracticeTemplate {
  const t = templates.get(id);
  if (!t) throw new Error(`Unknown practice template: ${id}`);
  return t;
}
export function hasTemplate(id: string) {
  return templates.has(id);
}
export function getMisconception(id: string) {
  return misconceptions.get(id);
}
export function hasMisconception(id: string) {
  return misconceptions.has(id);
}

/** Check a response. Misconceptions are only looked for among those the topic turned on. */
export function checkResponse(item: PracticeItem, response: Response, enabled: string[] = []): CheckResult {
  let correct: boolean;
  let slots: Record<string, boolean> | undefined;
  if (item.ask && response.kind === 'ask') {
    slots = Object.fromEntries(
      Object.entries(item.ask.answers).map(([k, v]) => [k, response.values[k] === v]),
    );
    correct = Object.values(slots).every(Boolean);
  } else if (item.choose && response.kind === 'choose') {
    correct = response.index === item.choose.answer;
  } else {
    correct = false;
  }
  if (correct) return { correct, slots };
  for (const id of enabled) {
    const m = misconceptions.get(id);
    if (m?.detect(item, response)) return { correct, slots, misconception: m };
  }
  return { correct, slots };
}

/** Next item for a round: weighted template choice, avoiding an exact repeat of the last item. */
export function nextItem(
  rng: Rng,
  picks: { id: string; weight: number }[],
  level: Level,
  previous?: PracticeItem,
): PracticeItem {
  for (let tries = 0; tries < 10; tries++) {
    const t = getTemplate(rng.weighted(picks.map((p) => ({ value: p.id, weight: p.weight }))));
    const item = t.generate(rng, level);
    if (!previous || JSON.stringify(item.vars) !== JSON.stringify(previous.vars)) return item;
  }
  return getTemplate(picks[0]!.id).generate(rng, level);
}

/** Splits an ask template into text and `[slot]` boxes. */
export function tokenize(
  template: string,
): ({ kind: 'text'; value: string } | { kind: 'slot'; id: string })[] {
  return template
    .split(/(\[\w+\])/)
    .filter(Boolean)
    .map((part) => {
      const m = /^\[(\w+)\]$/.exec(part);
      return m ? { kind: 'slot' as const, id: m[1]! } : { kind: 'text' as const, value: part };
    });
}
