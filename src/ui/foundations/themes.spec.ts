import { describe, expect, it } from 'vitest';
import { applyTheme, CLASSIC } from './themes';

describe('applyTheme', () => {
  it('sets Classic\'s four colours, and only those, on the root', () => {
    const set: Record<string, string> = {};
    const root = { style: { setProperty: (name: string, value: string | null) => void (set[name] = value ?? '') } };

    applyTheme(root, CLASSIC);

    expect(set).toEqual({ '--ink': '#1A1A1A', '--paper': '#F1E6CF', '--tile': '#FFFDF6', '--accent': '#BF1E1E' });
  });
});
