// The colour themes (spec-003 Themes table, research R3). A theme is four colours and its voice;
// applying one sets four custom properties that every simple component's CSS reads.

export interface ThemeColours {
  readonly ink: string;
  readonly paper: string;
  readonly tile: string;
  readonly accent: string;
}

export interface Theme {
  readonly label: string;
  readonly colours: ThemeColours;
  /** How Operator addresses the player: "Fill the grid, pal." */
  readonly address: string;
  readonly signOff: string;
  /** The main button's words. */
  readonly buttonLabel: string;
}

export const CLASSIC: Theme = {
  label: 'Classic',
  colours: { ink: '#1A1A1A', paper: '#F1E6CF', tile: '#FFFDF6', accent: '#BF1E1E' },
  address: 'pal',
  signOff: "Keep 'em coming",
  buttonLabel: 'Put it through!',
};

export const MIDNIGHT_BLUE: Theme = {
  label: 'Midnight blue',
  colours: { ink: '#1B2A4A', paper: '#D8E6F0', tile: '#F4F9FC', accent: '#C8441B' },
  address: 'chief',
  signOff: 'Next, please',
  buttonLabel: 'Connect me!',
};

const PLUM_AND_MINT: Theme = {
  label: 'Plum and mint',
  colours: { ink: '#2B1B3D', paper: '#D5F0E0', tile: '#F5FBF7', accent: '#C42A63' },
  address: 'darling',
  signOff: 'Do continue',
  buttonLabel: 'Ring it through!',
};

const AMBER_AND_TEAL: Theme = {
  label: 'Amber and teal',
  colours: { ink: '#3A1C12', paper: '#FFD9A0', tile: '#FFF6E4', accent: '#0E7C7B' },
  address: 'friend',
  signOff: 'Carry on',
  buttonLabel: 'Dial it in!',
};

const BUBBLEGUM: Theme = {
  label: 'Bubblegum',
  colours: { ink: '#1A1A1A', paper: '#FFC8DD', tile: '#FFF0F6', accent: '#2E5BFF' },
  address: 'sweetheart',
  signOff: 'More, more',
  buttonLabel: 'Make the call!',
};

const RACING_GREEN: Theme = {
  label: 'Racing green',
  colours: { ink: '#0F3D2E', paper: '#E8E2B8', tile: '#FAF7E2', accent: '#B5382B' },
  address: 'old sport',
  signOff: 'Press on',
  buttonLabel: 'Plug it in!',
};

/** The themes in order; the order is part of the seed rule (research R4). */
export const THEMES: readonly Theme[] = [CLASSIC, MIDNIGHT_BLUE, PLUM_AND_MINT, AMBER_AND_TEAL, BUBBLEGUM, RACING_GREEN];

/** Sets the theme's four colours on the root every component sits under. */
export function applyTheme(root: { readonly style: Pick<CSSStyleDeclaration, 'setProperty'> }, theme: Theme): void {
  for (const [name, colour] of Object.entries(theme.colours)) {
    root.style.setProperty(`--${name}`, colour);
  }
}

// 32-bit FNV-1a (research R4): the same seed gives the same theme on every device.
const FNV_OFFSET_BASIS = 0x811c9dc5;
const FNV_PRIME = 0x01000193;

/** The theme a puzzle is shown in, worked out from its seed; case does not matter (spec-003 FR-323, research R4). */
export function themeForSeed(seed: string | undefined): Theme {
  return THEMES[fnv1a((seed ?? '').toUpperCase()) % THEMES.length] ?? CLASSIC;
}

function fnv1a(text: string): number {
  let hash = FNV_OFFSET_BASIS;
  for (const character of text) {
    hash = Math.imul(hash ^ (character.codePointAt(0) ?? 0), FNV_PRIME) >>> 0;
  }
  return hash;
}
