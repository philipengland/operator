import { describe, expect, it } from 'vitest';
import { contrastRatio } from './contrast';
import { applyTheme, THEMES, themeForSeed } from './themes';

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

// Research R6: the colour pairs the components draw, and the contrast each needs.
const TEXT_CONTRAST = 4.5;
const GRAPHIC_CONTRAST = 3;
const PAIRS = [
  ['ink', 'tile', TEXT_CONTRAST],
  ['ink', 'paper', TEXT_CONTRAST],
  ['paper', 'ink', TEXT_CONTRAST],
  ['accent', 'tile', TEXT_CONTRAST],
  ['tile', 'accent', TEXT_CONTRAST],
  ['accent', 'paper', GRAPHIC_CONTRAST],
] as const;

describe('contrast in every theme (spec-003 AC-21)', () => {
  it.each(THEMES.flatMap((theme) => PAIRS.map(([foreground, background, required]) => [theme.label, foreground, background, required, theme] as const)))(
    '%s: %s on %s reaches %s:1',
    (_label, foreground, background, required, { colours }) => {
      expect(contrastRatio(colours[foreground], colours[background])).toBeGreaterThanOrEqual(required);
    },
  );
});

describe('themeForSeed (spec-003 AC-23, AC-24, AC-25)', () => {
  it('gives "4F7A21" Plum and mint every time, and "4f7a21" the same (AC-23, golden: research R4)', () => {
    const themes = [themeForSeed('4F7A21'), themeForSeed('4F7A21'), themeForSeed('4f7a21')].map((theme) => theme.label);

    expect(themes).toEqual(['Plum and mint', 'Plum and mint', 'Plum and mint']);
  });

  it('gives each theme between 70 and 130 of 600 seeds, "000000" to "000257" (AC-24)', () => {
    const seeds = Array.from({ length: 600 }, (_, index) => index.toString(16).toUpperCase().padStart(6, '0'));
    const counts = new Map(THEMES.map((theme) => [theme.label, 0]));

    seeds.forEach((seed) => {
      const { label } = themeForSeed(seed);
      counts.set(label, (counts.get(label) ?? 0) + 1);
    });

    for (const [label, count] of counts) {
      expect(count, `${label} is given ${count} times`).toBeGreaterThanOrEqual(70);
      expect(count, `${label} is given ${count} times`).toBeLessThanOrEqual(130);
    }
  });

  it('shows a puzzle with no seed, such as the fixed puzzle, in Classic (AC-25)', () => {
    expect(themeForSeed(undefined).label).toBe('Classic');
  });
});
