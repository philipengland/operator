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

const MIDNIGHT_BLUE: Theme = {
  label: 'Midnight blue',
  colours: { ink: '#1B2A4A', paper: '#D8E6F0', tile: '#F4F9FC', accent: '#C8441B' },
  address: 'chief',
  signOff: 'Next, please',
  buttonLabel: 'Connect me!',
};

/** The themes in order; the order is part of the seed rule (research R4). */
export const THEMES: readonly Theme[] = [CLASSIC, MIDNIGHT_BLUE];

/** Sets the theme's four colours on the root every component sits under. */
export function applyTheme(root: { readonly style: Pick<CSSStyleDeclaration, 'setProperty'> }, theme: Theme): void {
  for (const [name, colour] of Object.entries(theme.colours)) {
    root.style.setProperty(`--${name}`, colour);
  }
}
