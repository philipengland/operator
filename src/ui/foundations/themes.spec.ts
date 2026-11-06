import { describe, expect, it } from 'vitest';
import { applyTheme, THEMES } from './themes';

describe('THEMES (spec-003 AC-20)', () => {
  it('holds the six themes of the spec\'s Themes table, in order, each with exactly its four colours and its voice', () => {
    const table = THEMES.map(({ label, colours: { ink, paper, tile, accent }, address, signOff, buttonLabel }) => [label, ink, paper, tile, accent, address, signOff, buttonLabel]);

    expect(table).toEqual([
      ['Classic', '#1A1A1A', '#F1E6CF', '#FFFDF6', '#BF1E1E', 'pal', "Keep 'em coming", 'Put it through!'],
      ['Midnight blue', '#1B2A4A', '#D8E6F0', '#F4F9FC', '#C8441B', 'chief', 'Next, please', 'Connect me!'],
      ['Plum and mint', '#2B1B3D', '#D5F0E0', '#F5FBF7', '#C42A63', 'darling', 'Do continue', 'Ring it through!'],
      ['Amber and teal', '#3A1C12', '#FFD9A0', '#FFF6E4', '#0E7C7B', 'friend', 'Carry on', 'Dial it in!'],
      ['Bubblegum', '#1A1A1A', '#FFC8DD', '#FFF0F6', '#2E5BFF', 'sweetheart', 'More, more', 'Make the call!'],
      ['Racing green', '#0F3D2E', '#E8E2B8', '#FAF7E2', '#B5382B', 'old sport', 'Press on', 'Plug it in!'],
    ]);
    expect(THEMES.every((theme) => Object.keys(theme.colours).length === 4)).toBe(true);
  });

  it.each(THEMES.map((theme) => [theme.label, theme] as const))("applyTheme sets %s's four colours, and only those, on the root", (_label, theme) => {
    const set: Record<string, string> = {};
    const root = { style: { setProperty: (name: string, value: string | null) => void (set[name] = value ?? '') } };

    applyTheme(root, theme);

    const { ink, paper, tile, accent } = theme.colours;
    expect(set).toEqual({ '--ink': ink, '--paper': paper, '--tile': tile, '--accent': accent });
  });
});
