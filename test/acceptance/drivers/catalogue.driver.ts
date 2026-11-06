// Layer 3 contract — the component catalogue (spec-003). Signatures only until
// /speckit-implement builds the Playwright driver. Every method but publishedFiles needs a
// browser, so scenarios that browse the catalogue are tagged @ui and @catalogue.

import type { CatalogueSection, ColourToken, LibraryComponent, LibraryScreen, PlayScreenPart, Sample, ScreenSample, ThemeName, Typeface } from '../dsl/catalogue-vocabulary';
import type { Box, ScreenSize } from './phone.driver';

/** What a sample shows and what a screen reader hears from it. */
export interface SampleView {
  readonly text: string;
  /** null when the sample is hidden from screen readers. */
  readonly heardAs: string | null;
  readonly isButton: boolean;
  readonly isTextbox: boolean;
  readonly isUnavailable: boolean;
  readonly isSelected: boolean;
  readonly box: Box;
}

/** How a sample looks, mapped to the current theme's colour names. */
export interface SampleAppearance {
  readonly fill: ColourToken | 'none' | 'other';
  readonly outline: 'solid' | 'dashed' | 'none';
  readonly outlineColour: ColourToken | 'none' | 'other';
  readonly shadow: ColourToken | 'none' | 'other';
  readonly hasTailCorner: boolean;
}

/** Where the puzzle grid's parts sit, for the fixed 2 × 2 puzzle. */
export interface GridLayout {
  readonly columnPills: readonly Box[];
  readonly rowPills: readonly Box[];
  /** Cells by row, then column. */
  readonly cells: readonly (readonly Box[])[];
  readonly rowWorkings: readonly Box[];
  readonly columnWorkings: readonly Box[];
  readonly helperText: string;
}

export interface ScreenView {
  readonly screen: ScreenSize;
  readonly parts: Readonly<Record<PlayScreenPart, Box>>;
}

export interface PublishedFile {
  readonly path: string;
  readonly mentionsCatalogue: boolean;
}

export interface CatalogueDriver {
  open(): Promise<void>;
  sections(): Promise<readonly CatalogueSection[]>;
  componentsIn(section: CatalogueSection): Promise<readonly LibraryComponent[]>;
  sample(sample: Sample): Promise<SampleView>;
  appearance(sample: Sample): Promise<SampleAppearance>;
  typeface(sample: Sample): Promise<string>;
  typeInto(sample: Sample, text: string): Promise<void>;
  /** WCAG contrast of the sample against what it sits on, seen in greyscale. */
  greyscaleContrast(sample: Sample): Promise<number>;
  greyscaleImage(sample: Sample): Promise<Uint8Array>;
  builtFrom(component: LibraryComponent): Promise<readonly LibraryComponent[]>;
  requestsToOtherSites(): Promise<number>;
  gridLayout(sample: Sample): Promise<GridLayout>;
  /** The names a screen reader hears for each row of keys, top row first. */
  keypadRows(sample: Sample): Promise<readonly (readonly string[])[]>;
  mascotAndBubble(sample: Sample): Promise<{ readonly mascot: Box; readonly bubble: Box }>;
  openScreen(screen: LibraryScreen, sample: ScreenSample): Promise<void>;
  chooseScreenSample(sample: ScreenSample): Promise<void>;
  useScreen(size: ScreenSize): Promise<void>;
  screenView(): Promise<ScreenView>;
  chooseTheme(theme: ThemeName): Promise<void>;
  /** Every colour drawn on the page, as #RRGGBB. */
  coloursInUse(): Promise<readonly string[]>;
  /** Where every sample sits, keyed "<component> · <label>". */
  layoutOfEverySample(): Promise<Readonly<Record<string, Box>>>;
  accessibilityProblems(): Promise<readonly string[]>;
  /** The files the game build publishes (dist/). */
  publishedFiles(): Promise<readonly PublishedFile[]>;
}

export type { ColourToken, Typeface };
