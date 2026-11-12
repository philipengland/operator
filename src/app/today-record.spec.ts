import { describe, expect, it } from 'vitest';
import type { SolutionStore } from './solution-store';
import { readTodayRecord, writeTodayRecord } from './today-record';

const KEY = 'operator.today';

/** A store held in memory, starting with these records. */
function storeWith(records: Readonly<Record<string, string>> = {}): SolutionStore & { readonly records: Map<string, string> } {
  const held = new Map(Object.entries(records));
  return {
    records: held,
    read: (key) => held.get(key) ?? null,
    write: (key, value) => {
      if (value === null) {
        held.delete(key);
      } else {
        held.set(key, value);
      }
    },
  };
}

describe('writeTodayRecord', () => {
  it('keeps the day and preset in the agreed format, under operator.today', () => {
    const store = storeWith();

    writeTodayRecord(store, { date: '2026-11-10', preset: 'medium' });

    expect(JSON.parse(store.records.get(KEY) ?? 'null')).toEqual({ format: 1, date: '2026-11-10', preset: 'medium' });
  });
});

describe('readTodayRecord', () => {
  it('reads back the day and preset written', () => {
    const store = storeWith();
    writeTodayRecord(store, { date: '2026-11-10', preset: 'medium' });

    const lastPlayed = readTodayRecord(store);

    expect(lastPlayed).toEqual({ date: '2026-11-10', preset: 'medium' });
  });
});
