import { describe, expect, it } from 'vitest';
import type { SolutionStore } from './solution-store';
import { clearEarlierDay, readTodayRecord, writeTodayRecord } from './today-record';

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

  it('reads "unreadable" when the record is not JSON (AC-21)', () => {
    const lastPlayed = readTodayRecord(storeWith({ [KEY]: 'this is not a saved game' }));

    expect(lastPlayed).toBe('unreadable');
  });

  it('reads "unreadable" when the record has the wrong shape (AC-21)', () => {
    const lastPlayed = readTodayRecord(storeWith({ [KEY]: JSON.stringify({ format: 1, date: '2026-11-10' }) }));

    expect(lastPlayed).toBe('unreadable');
  });

  it('reads "none" on a phone that has never played', () => {
    const lastPlayed = readTodayRecord(storeWith());

    expect(lastPlayed).toBe('none');
  });
});

describe('clearEarlierDay (FR-714)', () => {
  const SAVED = JSON.stringify({ format: 1, solutions: [] });
  const TENTH_OF_NOVEMBERS = ['easy', 'medium', 'hard', 'collector'].map((preset) => `operator.solutions.daily-v1-2026-11-10-${preset}`);

  it("removes an earlier day's four solution records, never the worked example's", () => {
    const store = storeWith(Object.fromEntries([...TENTH_OF_NOVEMBERS, 'operator.solutions.worked-example'].map((key) => [key, SAVED])));

    clearEarlierDay(store, { date: '2026-11-10', preset: 'medium' }, '2026-11-11');

    expect([...store.records.keys()].filter((key) => key.startsWith('operator.solutions.'))).toEqual(['operator.solutions.worked-example']);
  });

  it("removes nothing when the record is of today", () => {
    const store = storeWith(Object.fromEntries(TENTH_OF_NOVEMBERS.map((key) => [key, SAVED])));

    clearEarlierDay(store, { date: '2026-11-10', preset: 'medium' }, '2026-11-10');

    expect([...store.records.keys()]).toEqual(TENTH_OF_NOVEMBERS);
  });

  it('rewrites the record for today, with the same preset, so the next new day clears this one', () => {
    const store = storeWith();
    writeTodayRecord(store, { date: '2026-11-10', preset: 'medium' });

    clearEarlierDay(store, readTodayRecord(store), '2026-11-11');

    expect(readTodayRecord(store)).toEqual({ date: '2026-11-11', preset: 'medium' });
  });
});
