// Layer 3 — drives the component catalogue in a phone-sized browser page, locating everything by
// role and accessible name only (docs/contracts/component-library.md, Catalogue). Methods not yet
// needed by an implemented criterion return values that cannot pass (spec-003 tasks, T013).

import type { Locator, Page } from '@playwright/test';
import type { CatalogueSection, LibraryComponent, Sample } from '../../dsl/catalogue-vocabulary';
import { NO_BOX, readAppearance, readGreyscaleContrast, readSampleView, readTypeface, textElement } from './catalogue-reading';
import type { CatalogueDriver, GridLayout, PublishedFile, SampleAppearance, SampleView, ScreenView } from '../catalogue.driver';
import type { Box } from '../phone.driver';
import { scanForAccessibilityProblems } from '../../support/axe';
import { publishedFiles } from '../published-files';

const CATALOGUE_PAGE = 'catalogue.html';
const CATALOGUE_TITLE = 'Operator component catalogue';
const CATALOGUE_SECTIONS: readonly CatalogueSection[] = ['Foundations', 'Simple components', 'Combined components', 'Screens'];
const BUILT_FROM_LINE = /^\s*Built from:\s*/;
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
    return (await regionNames(sectionRegion.getByRole('region'))) as LibraryComponent[];
  }

  /** What a sample shows, and what a screen reader hears from it (from the accessibility tree). */
  async sample(sample: Sample): Promise<SampleView> {
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
    const keys = this.sampleGroup(sample).getByRole('button');
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

  async mascotAndBubble(): Promise<{ readonly mascot: Box; readonly bubble: Box }> {
    return { mascot: NO_BOX, bubble: NO_BOX };
  }

  async openScreen(): Promise<void> {}

  async chooseScreenSample(): Promise<void> {}

  async useScreen(): Promise<void> {}

  async screenView(): Promise<ScreenView> {
    const parts = { 'Operator header': NO_BOX, 'Solutions counter': NO_BOX, 'Puzzle grid': NO_BOX, Keypad: NO_BOX, 'Main button': NO_BOX };
    return { screen: { width: 0, height: 0 }, parts };
  }

  async chooseTheme(): Promise<void> {}

  async coloursInUse(): Promise<readonly string[]> {
    return ['not read yet'];
  }

  async layoutOfEverySample(): Promise<Readonly<Record<string, Box>>> {
    return {};
  }

  async accessibilityProblems(): Promise<readonly string[]> {
    return ['not read yet'];
  }

  async publishedFiles(): Promise<readonly PublishedFile[]> {
    return publishedFiles();
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
