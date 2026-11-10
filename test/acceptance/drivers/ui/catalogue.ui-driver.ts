// Layer 3 — drives the component catalogue in a phone-sized browser page, locating everything by
// role and accessible name only (docs/contracts/component-library.md, Catalogue). Methods not yet
// needed by an implemented criterion return values that cannot pass (spec-003 tasks, T013).

import type { Locator, Page } from '@playwright/test';
import type { CatalogueSection, LibraryComponent, LibraryScreen, PageDots, PagePlace, PlayScreenPart, Sample, ScreenSample, ThemeName } from '../../dsl/catalogue-vocabulary';
import { NO_BOX, readAppearance, readColoursInUse, readDeclaredDots, readDotColour, readDotsShowing, readDrawnSurfaces, readGreyscaleContrast, readPartView, readSampleView, readTypeface, textElement } from './catalogue-reading';
import type { CatalogueDriver, GridLayout, PublishedFile, SampleAppearance, SampleView, ScreenView } from '../catalogue.driver';
import type { Box, ScreenSize } from '../phone.driver';
import { accessibilityProblems, scanForAccessibilityProblems } from '../../support/axe';
import { publishedFiles } from '../published-files';

const CATALOGUE_PAGE = 'catalogue.html';
const CATALOGUE_TITLE = 'Operator component catalogue';
const CATALOGUE_SECTIONS: readonly CatalogueSection[] = ['Foundations', 'Simple components', 'Combined components', 'Screens'];
const SCREEN_VIEW_PAGE = 'catalogue.html#play-screen';
const PLAY_SCREEN_PARTS: readonly PlayScreenPart[] = ['Operator header', 'Solutions counter', 'Puzzle grid', 'Keypad', 'Main button'];
// Each part of the play screen, found by the names the contracts give it (component-library.md,
// play-screen.md). The header has no name of its own: it is the element around the bubble whose
// title is "Hello, Operator!".
const FIND_SCREEN_PART: Readonly<Record<string, (screen: Locator) => Locator>> = {
  'Operator header': (screen) => screen.getByText('Hello, Operator!', { exact: true }).locator('xpath=../..'),
  'Solutions counter': (screen) => screen.getByText(/^Found \d+/).locator('xpath=..'),
  'Puzzle grid': (screen) => screen.getByRole('group', { name: 'Puzzle', exact: true }),
  Keypad: (screen) => screen.getByRole('group', { name: 'Keypad', exact: true }),
  'Main button': (screen) => screen.getByRole('button', { name: /, Check$/ }),
  'Row 1 target': (screen) => namedPart(screen, /Row 1 target/),
};
const BUILT_FROM_LINE = /^\s*Built from:\s*/;
// The dot grid's tile when the page does not say (spec-003 FR-329: a dot every 9 pixels).
const DEFAULT_TILE = 9;
// The fixed 2 × 2 puzzle (spec-001): lines 1 and 2, cells named by corner, row by row.
const FIXED_PUZZLE_LINES = [1, 2] as const;
const FIXED_PUZZLE_CELLS = [
  ['Top-left', 'Top-right'],
  ['Bottom-left', 'Bottom-right'],
] as const;


// A sample the catalogue does not show yet. It must not pass any check, including "not heard",
// so it is heard as a sentence no sample says.
const NOT_SHOWN: SampleView = {
  text: '',
  heardAs: 'this sample is not in the catalogue',
  isButton: false,
  isTextbox: false,
  isUnavailable: false,
  isSelected: false,
  box: NO_BOX,
};
const NOT_SHOWN_LOOK: SampleAppearance = { fill: 'other', outline: 'none', outlineColour: 'other', shadow: 'other', hasTailCorner: false };

export class UiCatalogueDriver implements CatalogueDriver {
  private readonly requestedUrls: string[] = [];

  constructor(private readonly page: Page) {
    page.on('request', (request) => this.requestedUrls.push(request.url()));
  }

  async open(): Promise<void> {
    await this.page.goto(CATALOGUE_PAGE);
    await this.page.getByRole('heading', { name: CATALOGUE_TITLE }).waitFor();
    await scanForAccessibilityProblems(this.page);
  }

  /** The catalogue's tier sections, in the order they appear. */
  async sections(): Promise<readonly CatalogueSection[]> {
    const names = await regionNames(this.page.getByRole('main').getByRole('region'));
    return names.filter((name): name is CatalogueSection => (CATALOGUE_SECTIONS as readonly string[]).includes(name));
  }

  /** The components a tier section lists, in the order they appear. */
  async componentsIn(section: CatalogueSection): Promise<readonly LibraryComponent[]> {
    const sectionRegion = this.page.getByRole('region', { name: section, exact: true });
    // A component's own region, not a region a sample contains (the Status bar is one, spec-007).
    const components = sectionRegion.getByRole('region').filter({ has: this.page.getByRole('heading', { level: 3 }) });
    return (await regionNames(components)) as LibraryComponent[];
  }

  /** What a sample shows, and what a screen reader hears from it (from the accessibility tree). */
  async sample(sample: Sample): Promise<SampleView> {
    if (sample.component === 'Play screen') {
      const part = this.screenPart(sample.label);
      return (await part.count()) === 0 ? NOT_SHOWN : readPartView(part);
    }
    const group = this.sampleGroup(sample);
    if ((await group.count()) === 0) {
      return NOT_SHOWN;
    }
    return readSampleView(group);
  }

  /** How a sample looks, with each colour named by the theme colour it is. */
  async appearance(sample: Sample): Promise<SampleAppearance> {
    const group = this.sampleGroup(sample);
    if ((await group.count()) === 0) {
      return NOT_SHOWN_LOOK;
    }
    const content = group.locator(':scope > *').first();
    return content.evaluate(readAppearance);
  }

  /** The typeface the sample's text is drawn in: the first family in use that has loaded. */
  async typeface(sample: Sample): Promise<string> {
    const group = this.sampleGroup(sample);
    if ((await group.count()) === 0) {
      return '';
    }
    await this.page.evaluate(() => document.fonts.ready);
    return textElement(group).evaluate(readTypeface);
  }

  async typeInto(sample: Sample, text: string): Promise<void> {
    await this.sampleGroup(sample).getByRole('textbox').fill(text);
  }

  /** WCAG contrast of the sample against what it sits on, read from a screenshot in greyscale. */
  async greyscaleContrast(sample: Sample): Promise<number> {
    const group = this.sampleGroup(sample);
    if ((await group.count()) === 0) {
      return 0;
    }
    const screenshot = await group.locator(':scope > *').first().screenshot({ animations: 'disabled' });
    return this.page.evaluate(readGreyscaleContrast, screenshot.toString('base64'));
  }

  /** A screenshot of the sample with colour removed (CSS grayscale filter), to compare states. */
  async greyscaleImage(sample: Sample): Promise<Uint8Array> {
    const group = this.sampleGroup(sample);
    if ((await group.count()) === 0) {
      return new Uint8Array();
    }
    const content = group.locator(':scope > *').first();
    const previousFilter = await content.evaluate((element) => {
      const style = (element as HTMLElement).style;
      const before = style.filter;
      style.filter = 'grayscale(1)';
      return before;
    });
    const image = await content.screenshot({ animations: 'disabled' });
    await content.evaluate((element, before) => ((element as HTMLElement).style.filter = before), previousFilter);
    return new Uint8Array(image);
  }

  /** The components named on a component's "Built from:" line; none when it has no such line. */
  async builtFrom(component: LibraryComponent): Promise<readonly LibraryComponent[]> {
    const line = this.componentRegion(component).getByText(BUILT_FROM_LINE);
    if ((await line.count()) === 0) {
      return [];
    }
    const text = (await line.first().innerText()).replace(BUILT_FROM_LINE, '');
    return text.split(',').map((name) => name.trim()).filter((name) => name.length > 0) as LibraryComponent[];
  }

  /** Requests since the page was created to any origin but the catalogue's own. */
  async requestsToOtherSites(): Promise<number> {
    const ownOrigin = new URL(this.page.url()).origin;
    return this.requestedUrls.filter((url) => /^https?:/.test(url) && new URL(url).origin !== ownOrigin).length;
  }

  /** Where the fixed 2 × 2 puzzle's parts sit, each found by its accessible name (play-screen contract). */
  async gridLayout(sample: Sample): Promise<GridLayout> {
    // Always the full 2 × 2 structure: a part that cannot be found has an unknown box, so every
    // position check runs and fails, rather than an empty grid passing with nothing to check.
    const puzzle = this.sampleGroup(sample).getByRole('group', { name: 'Puzzle', exact: true });
    const boxesOf = (patterns: readonly RegExp[]) => Promise.all(patterns.map((pattern) => partBox(puzzle, pattern)));
    const helper = puzzle.getByRole('paragraph').last();
    return {
      columnPills: await boxesOf(FIXED_PUZZLE_LINES.map((line) => new RegExp(`Column ${line} target`))),
      rowPills: await boxesOf(FIXED_PUZZLE_LINES.map((line) => new RegExp(`Row ${line} target`))),
      cells: await Promise.all(FIXED_PUZZLE_CELLS.map((row) => boxesOf(row.map((cell) => new RegExp(`^${cell} cell`))))),
      rowWorkings: await boxesOf(FIXED_PUZZLE_LINES.map((line) => new RegExp(`^Row ${line} working, `))),
      columnWorkings: await boxesOf(FIXED_PUZZLE_LINES.map((line) => new RegExp(`^Column ${line} working, `))),
      helperText: (await helper.count()) === 0 ? '' : (await helper.innerText()).trim(),
    };
  }

  /** The sample's buttons by name, row by row as they sit on screen: grouped by top edge, left to right. */
  async keypadRows(sample: Sample): Promise<readonly (readonly string[])[]> {
    // The first match is the sample itself; the keypad inside each sample is also a group named "Keypad".
    const keys = this.sampleGroup(sample).first().getByRole('button');
    const placed = await Promise.all(
      (await keys.all()).map(async (key) => ({ name: (await key.getAttribute('aria-label')) ?? (await key.innerText()).trim(), box: await boxOf(key) })),
    );
    const rows = new Map<number, { name: string; box: Box }[]>();
    placed.forEach((key) => {
      const top = Math.round(key.box.top);
      rows.set(top, [...(rows.get(top) ?? []), key]);
    });
    return [...rows.entries()]
      .sort(([firstTop], [secondTop]) => firstTop - secondTop)
      .map(([, row]) => row.sort((first, second) => first.box.left - second.box.left).map((key) => key.name));
  }

  /**
   * Where the header's mascot and speech bubble sit. The mascot is hidden from screen readers and
   * has no name to find it by, so the header's hidden part is the mascot and its heard part the bubble.
   */
  async mascotAndBubble(sample: Sample): Promise<{ readonly mascot: Box; readonly bubble: Box }> {
    const header = this.sampleGroup(sample).locator(':scope > *').first();
    const mascot = header.locator(':scope > [aria-hidden="true"]');
    const bubble = header.locator(':scope > :not([aria-hidden="true"])');
    const firstBox = async (part: Locator) => ((await part.count()) === 1 ? boxOf(part) : NO_BOX);
    return { mascot: await firstBox(mascot), bubble: await firstBox(bubble) };
  }

  /** Opens the screen alone at full size, showing the given sample. */
  async openScreen(screen: LibraryScreen, screenSample: ScreenSample): Promise<void> {
    await this.page.goto(SCREEN_VIEW_PAGE);
    await this.componentRegion(screen).waitFor();
    await this.chooseScreenSample(screenSample);
    await scanForAccessibilityProblems(this.page);
  }

  /** Presses the sample's button in the "Screen sample" switch, then looks at the top of the page again. */
  async chooseScreenSample(screenSample: ScreenSample): Promise<void> {
    const button = this.page.getByRole('group', { name: 'Screen sample', exact: true }).getByRole('button', { name: screenSample, exact: true });
    if ((await button.count()) === 0) {
      return; // No such sample to choose: the screen stays as it is, and the scenario's checks decide.
    }
    await button.click();
    await button.and(this.page.locator('[aria-pressed="true"]')).waitFor();
    await this.page.evaluate(() => window.scrollTo(0, 0));
  }

  async useScreen(size: ScreenSize): Promise<void> {
    await this.page.setViewportSize(size);
  }

  /** The screen's size and where its five parts sit, relative to the top of the screen. */
  async screenView(): Promise<ScreenView> {
    const screen = this.page.viewportSize() ?? { width: 0, height: 0 };
    const boxes = await Promise.all(PLAY_SCREEN_PARTS.map(async (part) => [part, await boxIfOne(this.screenPart(part))] as const));
    return { screen, parts: Object.fromEntries(boxes) as ScreenView['parts'] };
  }

  /** Presses the theme's button in the catalogue's "Theme" switch, waits until it shows as chosen, and looks back to the top. */
  async chooseTheme(theme: ThemeName): Promise<void> {
    const button = this.page.getByRole('group', { name: 'Theme', exact: true }).getByRole('button', { name: theme, exact: true });
    if ((await button.count()) === 0) {
      return;
    }
    await button.click();
    await button.and(this.page.locator('[aria-pressed="true"]')).waitFor();
    await this.page.evaluate(() => window.scrollTo(0, 0)); // The switch is below the screen; look back up at it.
  }

  /** Every colour drawn on the catalogue page; never empty, so "only the theme's colours" cannot pass on nothing. */
  async coloursInUse(): Promise<readonly string[]> {
    const colours = await this.page.evaluate(readColoursInUse);
    return colours.length > 0 ? colours : ['no colours were read'];
  }

  /**
   * Where every component region and every named group in it (each sample, the play screen's
   * parts) sits on the page, numbered in document order. Never empty, so "nothing moved" cannot
   * pass when nothing was read.
   */
  async layoutOfEverySample(): Promise<Readonly<Record<string, Box>>> {
    const main = this.page.getByRole('main');
    const parts = main.getByRole('region').or(main.getByRole('group'));
    const layout = await parts.evaluateAll((elements) =>
      elements.map((element, index) => {
        const box = element.getBoundingClientRect();
        const name = `${index + 1}. ${element.getAttribute('aria-label') ?? ''}`;
        return [name, { left: box.left + window.scrollX, top: box.top + window.scrollY, right: box.right + window.scrollX, bottom: box.bottom + window.scrollY }] as const;
      }),
    );
    return layout.length > 0 ? Object.fromEntries(layout) : { 'no samples were read': unknownBox() };
  }

  /** What the accessibility scan finds on the catalogue in the theme now shown. */
  async accessibilityProblems(): Promise<readonly string[]> {
    return accessibilityProblems(this.page);
  }

  /**
   * The page's Ben-Day dots at the top or the bottom of the page: the paper, size and spacing as
   * the root element declares them, and the dot colour as drawn, from a screenshot of one tile of
   * the dot grid there. Null when the page declares no dots, or none is drawn there.
   */
  async pageDots(place: PagePlace): Promise<PageDots | null> {
    const isBottom = place === 'bottom of the page';
    await this.page.evaluate((toBottom) => window.scrollTo(0, toBottom ? document.documentElement.scrollHeight : 0), isBottom);
    const declared = await this.page.evaluate(readDeclaredDots);
    if (!declared.hasDots) {
      return null;
    }
    const tile = Number.isFinite(declared.everyPixels) && declared.everyPixels > 0 ? declared.everyPixels : DEFAULT_TILE;
    const y = isBottom ? await this.lastWholeTileOnScreen(tile) : 0;
    const screenshot = await this.page.screenshot({ clip: { x: 0, y, width: tile, height: tile }, animations: 'disabled' });
    const drawn = await this.page.evaluate(readDotColour, [screenshot.toString('base64'), declared.paper] as const);
    return drawn ? { dotColour: drawn, paper: declared.paper, sizeInPixels: declared.sizeInPixels, everyPixels: declared.everyPixels } : null;
  }

  /**
   * Whether the page's dots show on any of a play-screen part's own surfaces (its bubble, panel,
   * pills, cells, keys or button: anything with a fill or an outline), looking for the dot pattern
   * drawn on the page. The page seen between them is not the part. True when the part cannot be
   * found, so a missing part never passes.
   */
  async showsDots(part: PlayScreenPart): Promise<boolean> {
    const element = this.screenPart(part);
    if ((await element.count()) !== 1) {
      return true;
    }
    const dots = await this.pageDots('top of the page');
    if (!dots) {
      return false;
    }
    for (const area of await element.evaluate(readDrawnSurfaces)) {
      const pngBase64 = (await this.page.screenshot({ clip: area, animations: 'disabled' })).toString('base64');
      const search = { pngBase64, area, dotColour: dots.dotColour, paper: dots.paper, tile: dots.everyPixels };
      if (await this.page.evaluate(readDotsShowing, search)) {
        return true;
      }
    }
    return false;
  }

  /** Where, on the screen, the last whole tile of the dot grid starts, with the page scrolled to its bottom. */
  private async lastWholeTileOnScreen(tile: number): Promise<number> {
    return this.page.evaluate((size) => {
      const pageHeight = document.documentElement.scrollHeight;
      const lastTileTop = Math.floor((pageHeight - size) / size) * size;
      return lastTileTop - window.scrollY;
    }, tile);
  }

  async publishedFiles(): Promise<readonly PublishedFile[]> {
    return publishedFiles();
  }

  /** One part of the play screen, by the name its contract gives it; nothing when the label is not a part. */
  protected screenPart(label: string): Locator {
    const find = FIND_SCREEN_PART[label];
    const screen = this.componentRegion('Play screen');
    return find ? find(screen) : screen.locator(':scope > :not(*)');
  }

  /** The region named by the component, inside the catalogue. */
  protected componentRegion(component: LibraryComponent): Locator {
    return this.page.getByRole('region', { name: component, exact: true });
  }

  /** One labelled sample of a component: a group named by its label inside the component's region. */
  protected sampleGroup({ component, label }: Sample): Locator {
    return this.componentRegion(component).getByRole('group', { name: label, exact: true });
  }
}

/** The accessible names of these regions, in document order (the catalogue names regions with aria-label). */
async function regionNames(regions: Locator): Promise<readonly string[]> {
  const names = await regions.evaluateAll((elements) => elements.map((element) => element.getAttribute('aria-label') ?? ''));
  return names.filter((name) => name.length > 0);
}

/**
 * The box of the part named by the pattern: a button with that name, or else the element holding
 * a visually hidden name with that text (shown pills and workings speak through one).
 */
async function partBox(within: Locator, name: RegExp): Promise<Box> {
  const button = within.getByRole('button', { name });
  if ((await button.count()) > 0) {
    return boxOf(button.first());
  }
  const spokenName = within.getByText(name);
  return (await spokenName.count()) > 0 ? boxOf(spokenName.first().locator('xpath=..')) : NO_BOX;
}

async function boxOf(element: Locator): Promise<Box> {
  const box = await element.boundingBox();
  return box ? { left: box.x, top: box.y, right: box.x + box.width, bottom: box.y + box.height } : NO_BOX;
}

/** A part named by the pattern: a button with that name, or the element holding a hidden name with that text. */
function namedPart(within: Locator, name: RegExp): Locator {
  return within.getByRole('button', { name }).or(within.getByText(name).locator('xpath=..')).first();
}

/** The box of the only element matched; unknown when there is none or more than one. */
async function boxIfOne(element: Locator): Promise<Box> {
  return (await element.count()) === 1 ? boxOf(element) : unknownBox();
}

let unknownBoxesGiven = 0;

/**
 * A box for a part that cannot be read. Its NaN edges fail every position check, and its own
 * number means it never equals another unknown box, so "nothing moved" cannot pass on parts
 * that are not there (NaN alone compares equal in toEqual).
 */
function unknownBox(): Box {
  unknownBoxesGiven += 1;
  return Object.assign({}, NO_BOX, { unknown: unknownBoxesGiven });
}
