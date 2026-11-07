// Layer 2 — the component catalogue (spec-003): browsing the library, its samples, its play
// screen and its themes, in the design guide's terms.

import { expect } from '@playwright/test';
import type { Box } from '../drivers/phone.driver';
import type { CatalogueDriver } from '../drivers/catalogue.driver';
import type {
  CatalogueSection,
  LibraryComponent,
  LibraryScreen,
  Look,
  PageDots,
  PagePlace,
  PlayScreenPart,
  Sample,
  ScreenSample,
  ThemeColours,
  ThemeName,
  Typeface,
} from './catalogue-vocabulary';

/** WCAG 2.2 minimum touch target, in CSS pixels (constitution IV). */
const SMALLEST_TOUCH_TARGET = 44;

/** WCAG 2.2 non-text contrast: icons must stand out 3:1, seen in greyscale. */
const NON_TEXT_CONTRAST = 3;

/**
 * spec-003 research R10: a browser may round a mixed colour by one level in each of red, green
 * and blue, so a dot colour within one level per channel is the spec's colour.
 */
const DOT_COLOUR_ROUNDING = 1;

export class CatalogueDsl {
  private rememberedLayout: Readonly<Record<string, Box>> | undefined;

  constructor(private readonly driver: () => CatalogueDriver) {}

  async open(): Promise<void> {
    await this.driver().open();
  }

  // The catalogue's structure.

  async expectSectionsInOrder(sections: readonly CatalogueSection[]): Promise<void> {
    expect(await this.driver().sections(), 'catalogue sections, in order').toEqual(sections);
  }

  async expectComponentsIn(section: CatalogueSection, components: readonly LibraryComponent[]): Promise<void> {
    expect(await this.driver().componentsIn(section), `components in ${section}`).toEqual(components);
  }

  async expectBuiltFrom(component: LibraryComponent, parts: readonly LibraryComponent[]): Promise<void> {
    expect([...(await this.driver().builtFrom(component))].sort(), `what ${component} is built from`).toEqual([...parts].sort());
  }

  // One sample: what it shows, what is heard, how it looks.

  async expectShows(component: LibraryComponent, label: string, text: string): Promise<void> {
    expect((await this.view(component, label)).text, `${component} "${label}" shows`).toBe(text);
  }

  async expectHeardAs(component: LibraryComponent, label: string, heard: string): Promise<void> {
    expect((await this.view(component, label)).heardAs, `${component} "${label}" is heard as`).toBe(heard);
  }

  /** What is heard contains each of these words, in any order. */
  async expectHeardToInclude(component: LibraryComponent, label: string, words: readonly string[]): Promise<void> {
    const heard = (await this.view(component, label)).heardAs ?? '';
    for (const word of words) {
      expect(heard, `${component} "${label}" is heard to include "${word}"`).toContain(word);
    }
  }

  async expectNotHeard(component: LibraryComponent, label: string): Promise<void> {
    expect((await this.view(component, label)).heardAs, `${component} "${label}" is hidden from screen readers`).toBeNull();
  }

  /** A real button, at least 44 × 44 pixels. */
  async expectButton(component: LibraryComponent, label: string): Promise<void> {
    const view = await this.view(component, label);
    expect(view.isButton, `${component} "${label}" is a button`).toBe(true);
    expect(width(view.box), `${component} "${label}" width`).toBeGreaterThanOrEqual(SMALLEST_TOUCH_TARGET);
    expect(height(view.box), `${component} "${label}" height`).toBeGreaterThanOrEqual(SMALLEST_TOUCH_TARGET);
  }

  async expectTextbox(component: LibraryComponent, label: string): Promise<void> {
    expect((await this.view(component, label)).isTextbox, `${component} "${label}" is a text field`).toBe(true);
  }

  async expectUnavailable(component: LibraryComponent, label: string): Promise<void> {
    expect((await this.view(component, label)).isUnavailable, `${component} "${label}" is heard as unavailable`).toBe(true);
  }

  async expectSelected(component: LibraryComponent, label: string): Promise<void> {
    expect((await this.view(component, label)).isSelected, `${component} "${label}" is heard as selected`).toBe(true);
  }

  async expectTypeface(component: LibraryComponent, label: string, typeface: Typeface): Promise<void> {
    expect(await this.driver().typeface(sample(component, label)), `${component} "${label}" typeface`).toBe(typeface);
  }

  async typeInto(component: LibraryComponent, label: string, text: string): Promise<void> {
    await this.driver().typeInto(sample(component, label), text);
  }

  /** Only the parts of the look the scenario names are checked. */
  async expectLook(component: LibraryComponent, label: string, look: Look): Promise<void> {
    const ref = sample(component, label);
    const appearance = await this.driver().appearance(ref);
    const checked = { ...appearance, sizeInPixels: width((await this.driver().sample(ref)).box) };
    for (const [part, expected] of Object.entries(look)) {
      expect(checked[part as keyof typeof checked], `${component} "${label}" ${part}`).toBe(expected);
    }
  }

  async expectVisibleInGreyscale(component: LibraryComponent, label: string): Promise<void> {
    const contrast = await this.driver().greyscaleContrast(sample(component, label));
    expect(contrast, `${component} "${label}" contrast in greyscale`).toBeGreaterThanOrEqual(NON_TEXT_CONTRAST);
  }

  /** No two of these samples look the same with colour removed. */
  async expectToldApartInGreyscale(component: LibraryComponent, labels: readonly string[]): Promise<void> {
    const images = await Promise.all(labels.map((label) => this.driver().greyscaleImage(sample(component, label))));
    labels.forEach((first, i) => {
      labels.slice(i + 1).forEach((second, offset) => {
        const same = Buffer.from(images[i] ?? []).equals(Buffer.from(images[i + 1 + offset] ?? []));
        expect(same, `${component} "${first}" and "${second}" look the same in greyscale`).toBe(false);
      });
    });
  }

  async expectNoRequestsToOtherSites(): Promise<void> {
    expect(await this.driver().requestsToOtherSites(), 'requests to other sites').toBe(0);
  }

  // Combined components with a layout of their own.

  /** Column pills above the cells, row pills to their left, workings at the far ends. */
  async expectPuzzleGridLayout(label: string, helperText: string): Promise<void> {
    const grid = await this.driver().gridLayout(sample('Puzzle grid', label));
    grid.cells.forEach((row, rowIndex) => {
      row.forEach((cell, columnIndex) => {
        const where = `row ${rowIndex + 1}, column ${columnIndex + 1}`;
        expect(isAbove(at(grid.columnPills, columnIndex), cell), `column pill ${columnIndex + 1} is above the cell at ${where}`).toBe(true);
        expect(isLeftOf(at(grid.rowPills, rowIndex), cell), `row pill ${rowIndex + 1} is left of the cell at ${where}`).toBe(true);
        expect(isLeftOf(cell, at(grid.rowWorkings, rowIndex)), `row ${rowIndex + 1}'s working is right of the cell at ${where}`).toBe(true);
        expect(isAbove(cell, at(grid.columnWorkings, columnIndex)), `column ${columnIndex + 1}'s working is below the cell at ${where}`).toBe(true);
      });
    });
    expect(grid.helperText, 'helper line').toBe(helperText);
  }

  async expectKeypadRows(label: string, rows: readonly (readonly string[])[]): Promise<void> {
    expect(await this.driver().keypadRows(sample('Keypad', label)), 'keypad keys, row by row').toEqual(rows);
  }

  async expectMascotBesideBubble(label: string): Promise<void> {
    const { mascot, bubble } = await this.driver().mascotAndBubble(sample('Operator header', label));
    expect(isLeftOf(mascot, bubble), 'the mascot is beside the speech bubble').toBe(true);
  }

  // Screens.

  async openScreen(screen: LibraryScreen, screenSample: ScreenSample): Promise<void> {
    await this.driver().openScreen(screen, screenSample);
  }

  async chooseScreenSample(screenSample: ScreenSample): Promise<void> {
    await this.driver().chooseScreenSample(screenSample);
  }

  async useScreen(widthInPixels: number, heightInPixels: number): Promise<void> {
    await this.driver().useScreen({ width: widthInPixels, height: heightInPixels });
  }

  async expectPlayScreenTopToBottom(parts: readonly PlayScreenPart[]): Promise<void> {
    const { parts: boxes } = await this.driver().screenView();
    parts.slice(1).forEach((part, index) => {
      const above = parts[index] as PlayScreenPart;
      expect(isAbove(boxes[above], boxes[part]), `${above} is above ${part}`).toBe(true);
    });
  }

  async expectScreenFitsWithoutScrolling(): Promise<void> {
    const { screen, parts } = await this.driver().screenView();
    for (const [part, box] of Object.entries(parts)) {
      const isOnScreen = box.left >= 0 && box.top >= 0 && box.right <= screen.width && box.bottom <= screen.height;
      expect(isOnScreen, `${part} is on screen without scrolling`).toBe(true);
    }
  }

  async expectScreenLayoutSameFor(samples: readonly ScreenSample[]): Promise<void> {
    const layouts = [];
    for (const screenSample of samples) {
      await this.driver().chooseScreenSample(screenSample);
      layouts.push((await this.driver().screenView()).parts);
    }
    for (const layout of layouts.slice(1)) {
      expect(layout, `the play screen's layout is the same for ${samples.join(', ')}`).toEqual(layouts[0]);
    }
  }

  // Themes.

  async chooseTheme(theme: ThemeName): Promise<void> {
    await this.driver().chooseTheme(theme);
  }

  /** Every colour drawn is one of the theme's four. */
  async expectOnlyThemeColours(theme: ThemeName, colours: ThemeColours): Promise<void> {
    const allowed = Object.values(colours).map((colour) => colour.toUpperCase());
    for (const colour of await this.driver().coloursInUse()) {
      expect(allowed, `${colour} is one of ${theme}'s four colours`).toContain(colour.toUpperCase());
    }
  }

  async rememberLayout(): Promise<void> {
    this.rememberedLayout = await this.driver().layoutOfEverySample();
  }

  async expectNothingMoved(): Promise<void> {
    expect(await this.driver().layoutOfEverySample(), 'every sample is where it was').toEqual(this.rememberedLayout);
  }

  async expectNoAccessibilityProblems(theme: ThemeName): Promise<void> {
    expect(await this.driver().accessibilityProblems(), `accessibility problems in ${theme}`).toEqual([]);
  }

  // The page's Ben-Day dots (User Story 6).

  /** The page shows dots of this colour, size and spacing, on this paper, at this place. */
  async expectPageDots(place: PagePlace, dots: PageDots): Promise<void> {
    const drawn = await this.driver().pageDots(place);
    expect(drawn, `dots are drawn at the ${place}`).not.toBeNull();
    if (!drawn) {
      return;
    }
    expect(channelsApart(drawn.dotColour, dots.dotColour), `the dots are ${dots.dotColour} (drawn ${drawn.dotColour})`).toBeLessThanOrEqual(DOT_COLOUR_ROUNDING);
    expect(drawn.paper.toUpperCase(), 'the paper behind the dots').toBe(dots.paper.toUpperCase());
    expect(drawn.sizeInPixels, 'each dot is this many pixels across').toBeCloseTo(dots.sizeInPixels, 0);
    expect(drawn.everyPixels, 'the dots are this many pixels apart').toBeCloseTo(dots.everyPixels, 0);
  }

  /** Some dots are drawn on the page, in whatever theme is shown. */
  async expectPageDotsShown(theme: ThemeName): Promise<void> {
    expect(await this.driver().pageDots('top of the page'), `dots are drawn in ${theme}`).not.toBeNull();
  }

  /** None of these parts of the play screen shows a dot: each has its own plain fill. */
  async expectNoDotsOn(parts: readonly PlayScreenPart[]): Promise<void> {
    for (const part of parts) {
      expect(await this.driver().showsDots(part), `${part} shows dots`).toBe(false);
    }
  }

  // Publishing.

  async expectNotPublished(): Promise<void> {
    const files = await this.driver().publishedFiles();
    expect(files.length, 'the game has been built').toBeGreaterThan(0);
    for (const file of files) {
      expect(file.mentionsCatalogue, `${file.path} is part of the catalogue`).toBe(false);
    }
  }

  private view(component: LibraryComponent, label: string) {
    return this.driver().sample(sample(component, label));
  }
}

function sample(component: LibraryComponent, label: string): Sample {
  return { component, label };
}

function at(boxes: readonly Box[], index: number): Box {
  const box = boxes[index];
  if (!box) {
    throw new Error(`No box at position ${index + 1}`);
  }
  return box;
}

/** The largest difference in red, green or blue between two #RRGGBB colours. */
function channelsApart(first: string, second: string): number {
  const channels = (colour: string) => (colour.match(/[0-9a-f]{2}/gi) ?? []).map((pair) => Number.parseInt(pair, 16));
  const [a, b] = [channels(first), channels(second)];
  return a.length === 3 && b.length === 3 ? Math.max(...a.map((value, index) => Math.abs(value - (b[index] ?? 0)))) : Number.POSITIVE_INFINITY;
}

function width(box: Box): number {
  return box.right - box.left;
}

function height(box: Box): number {
  return box.bottom - box.top;
}

function isLeftOf(a: Box, b: Box): boolean {
  return a.right <= b.left;
}

function isAbove(a: Box, b: Box): boolean {
  return a.bottom <= b.top;
}
