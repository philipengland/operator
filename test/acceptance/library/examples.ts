// Layer 1 — the examples from spec-003: the six themes, and the library's components by tier.

import type { CombinedComponent, SimpleComponent, ThemeColours, ThemeName } from '../dsl/catalogue-vocabulary';

/** spec-003 Themes table. */
export const THEME_COLOURS: Readonly<Record<ThemeName, ThemeColours>> = {
  Classic: { ink: '#1A1A1A', paper: '#F1E6CF', tile: '#FFFDF6', accent: '#BF1E1E' },
  'Midnight blue': { ink: '#1B2A4A', paper: '#D8E6F0', tile: '#F4F9FC', accent: '#C8441B' },
  'Plum and mint': { ink: '#2B1B3D', paper: '#D5F0E0', tile: '#F5FBF7', accent: '#C42A63' },
  'Amber and teal': { ink: '#3A1C12', paper: '#FFD9A0', tile: '#FFF6E4', accent: '#0E7C7B' },
  Bubblegum: { ink: '#1A1A1A', paper: '#FFC8DD', tile: '#FFF0F6', accent: '#2E5BFF' },
  'Racing green': { ink: '#0F3D2E', paper: '#E8E2B8', tile: '#FAF7E2', accent: '#B5382B' },
};

export const ALL_THEMES = Object.keys(THEME_COLOURS) as readonly ThemeName[];

export const SIMPLE_COMPONENTS: readonly SimpleComponent[] = ['Text', 'Button', 'Text input', 'Icon', 'Surface', 'Badge', 'Mascot'];

export const COMBINED_COMPONENTS: readonly CombinedComponent[] = [
  'Speech bubble',
  'Operator header',
  'Solutions counter',
  'Target pill',
  'Grid cell',
  'Line working',
  'Puzzle grid',
  'Keypad',
];
