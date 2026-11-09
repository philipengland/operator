import { describe, expect, it } from 'vitest';
import { createBrowserStore } from './browser-store';

/** A stand-in for localStorage, starting with these records. */
function storageWith(records: Readonly<Record<string, string>> = {}) {
  const held = new Map(Object.entries(records));
  return {
    held,
    getItem: (key: string) => held.get(key) ?? null,
    setItem: (key: string, value: string) => void held.set(key, value),
    removeItem: (key: string) => void held.delete(key),
  };
}

describe('createBrowserStore', () => {
  it('reads what is stored (spec-006 AC-14)', () => {
    const storage = storageWith({ key: 'a value' });

    expect(createBrowserStore(() => storage).read('key')).toBe('a value');
  });

  it('writes a value, and removes the record when given null (spec-006 AC-18)', () => {
    const storage = storageWith({ other: 'x' });
    const store = createBrowserStore(() => storage);

    store.write('key', 'a value');
    store.write('other', null);

    expect([...storage.held]).toEqual([['key', 'a value']]);
  });

  it('reads nothing when the browser refuses (spec-006 AC-19)', () => {
    const store = createBrowserStore(() => {
      throw new Error('blocked');
    });

    expect(() => store.read('key')).not.toThrow();
  });
});
