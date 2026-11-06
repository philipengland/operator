// Layer 3 — drives the component catalogue in a phone-sized browser page, locating everything by
// role and accessible name only (docs/contracts/component-library.md, Catalogue). Methods not yet
// needed by an implemented criterion return values that cannot pass (spec-003 tasks, T013).

import type { Locator, Page } from '@playwright/test';
import type { CatalogueSection, LibraryComponent } from '../../dsl/catalogue-vocabulary';
import type { CatalogueDriver, GridLayout, PublishedFile, SampleAppearance, SampleView, ScreenView } from '../catalogue.driver';
import type { Box } from '../phone.driver';
import { scanForAccessibilityProblems } from '../../support/axe';
import { publishedFiles } from '../published-files';

const CATALOGUE_PAGE = 'catalogue.html';
const CATALOGUE_TITLE = 'Operator component catalogue';
const CATALOGUE_SECTIONS: readonly CatalogueSection[] = ['Foundations', 'Simple components', 'Combined components', 'Screens'];

// Unknown positions: NaN compares false, so nothing unread can pass a layout check.
const NO_BOX: Box = { left: Number.NaN, top: Number.NaN, right: Number.NaN, bottom: Number.NaN };

const NOT_READ_YET: SampleView = {
  text: '',
  heardAs: '',
  isButton: false,
  isTextbox: false,
  isUnavailable: false,
  isSelected: false,
  box: NO_BOX,
};

export class UiCatalogueDriver implements CatalogueDriver {
  constructor(private readonly page: Page) {}

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

  async sample(): Promise<SampleView> {
    return NOT_READ_YET;
  }

  async appearance(): Promise<SampleAppearance> {
    return { fill: 'other', outline: 'none', outlineColour: 'other', shadow: 'other', hasTailCorner: false };
  }

  async typeface(): Promise<string> {
    return '';
  }

  async typeInto(): Promise<void> {}

  async greyscaleContrast(): Promise<number> {
    return 0;
  }

  async greyscaleImage(): Promise<Uint8Array> {
    return new Uint8Array();
  }

  async builtFrom(): Promise<readonly LibraryComponent[]> {
    return [];
  }

  async requestsToOtherSites(): Promise<number> {
    return Number.NaN;
  }

  async gridLayout(): Promise<GridLayout> {
    return { columnPills: [], rowPills: [], cells: [], rowWorkings: [], columnWorkings: [], helperText: '' };
  }

  async keypadRows(): Promise<readonly (readonly string[])[]> {
    return [];
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
}

/** The accessible names of these regions, in document order (the catalogue names regions with aria-label). */
async function regionNames(regions: Locator): Promise<readonly string[]> {
  const names = await regions.evaluateAll((elements) => elements.map((element) => element.getAttribute('aria-label') ?? ''));
  return names.filter((name) => name.length > 0);
}
