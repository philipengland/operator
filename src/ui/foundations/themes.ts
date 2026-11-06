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
}

export const CLASSIC: Theme = {
  label: 'Classic',
  colours: { ink: '#1A1A1A', paper: '#F1E6CF', tile: '#FFFDF6', accent: '#BF1E1E' },
};

/** Sets the theme's four colours on the root every component sits under. */
export function applyTheme(root: { readonly style: Pick<CSSStyleDeclaration, 'setProperty'> }, theme: Theme): void {
  for (const [name, colour] of Object.entries(theme.colours)) {
    root.style.setProperty(`--${name}`, colour);
  }
}
