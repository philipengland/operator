import { describe, expect, it } from 'vitest';
import { applyTheme, CLASSIC, THEMES } from './themes';

describe('applyTheme', () => {
  it('sets Classic\'s four colours, and only those, on the root', () => {
    const set: Record<string, string> = {};
    const root = { style: { setProperty: (name: string, value: string | null) => void (set[name] = value ?? '') } };

    applyTheme(root, CLASSIC);

    expect(set).toEqual({ '--ink': '#1A1A1A', '--paper': '#F1E6CF', '--tile': '#FFFDF6', '--accent': '#BF1E1E' });
  });
});

describe('THEMES', () => {
  it('starts with Classic, then Midnight blue, each with its four colours and its voice', () => {
    expect(THEMES.slice(0, 2)).toEqual([
      {
        label: 'Classic',
        colours: { ink: '#1A1A1A', paper: '#F1E6CF', tile: '#FFFDF6', accent: '#BF1E1E' },
        address: 'pal',
        signOff: "Keep 'em coming",
        buttonLabel: 'Put it through!',
      },
      {
        label: 'Midnight blue',
        colours: { ink: '#1B2A4A', paper: '#D8E6F0', tile: '#F4F9FC', accent: '#C8441B' },
        address: 'chief',
        signOff: 'Next, please',
        buttonLabel: 'Connect me!',
      },
    ]);
  });
});
