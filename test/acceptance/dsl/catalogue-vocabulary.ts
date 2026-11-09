// Layer 2 — the words the component-library scenarios use (spec-003).

export type CatalogueSection = 'Foundations' | 'Simple components' | 'Combined components' | 'Screens';

export type SimpleComponent = 'Text' | 'Button' | 'Text input' | 'Icon' | 'Surface' | 'Badge' | 'Mascot' | 'Dialog';

export type CombinedComponent =
  | 'Speech bubble'
  | 'Operator header'
  | 'Solutions counter'
  | 'Target pill'
  | 'Grid cell'
  | 'Line working'
  | 'Puzzle grid'
  | 'Keypad'
  | 'Confirm dialog';

export type LibraryScreen = 'Play screen' | 'Solution list' | 'Solution view';

export type LibraryComponent = SimpleComponent | CombinedComponent | LibraryScreen;

/** The part of a screen a combined component or the main button fills. */
export type PlayScreenPart = 'Operator header' | 'Solutions counter' | 'Puzzle grid' | 'Keypad' | 'Main button';

/** The play screen's fixed samples (spec-003 AC-17). */
export type ScreenSample = 'Just opened' | 'Row 1 correct' | 'All found';

export type ThemeName = 'Classic' | 'Midnight blue' | 'Plum and mint' | 'Amber and teal' | 'Bubblegum' | 'Racing green';

/** The four colours every theme is made of. */
export type ColourToken = 'ink' | 'paper' | 'tile' | 'accent';

export type ThemeColours = Readonly<Record<ColourToken, string>>;

export type Typeface = 'Chewy' | 'Nunito';

/** One labelled example of a component in the catalogue, such as the solutions counter's "Complete". */
export interface Sample {
  readonly component: LibraryComponent;
  readonly label: string;
}

/** Where on the page the Ben-Day dots are looked at (spec-003 User Story 6). */
export type PagePlace = 'top of the page' | 'bottom of the page';

/** The page's Ben-Day dots: their colour and the paper they sit on (#RRGGBB), their size and spacing. */
export interface PageDots {
  readonly dotColour: string;
  readonly paper: string;
  readonly sizeInPixels: number;
  readonly everyPixels: number;
}

/** How a sample looks, in the theme's own terms. Only the parts a scenario names are checked. */
export interface Look {
  readonly fill?: ColourToken | 'none';
  readonly outline?: 'solid' | 'dashed' | 'none';
  readonly outlineColour?: ColourToken;
  readonly shadow?: ColourToken | 'none';
  readonly hasTailCorner?: boolean;
  readonly sizeInPixels?: number;
}
