// Layer 3 — drives the component catalogue in a phone-sized browser page, locating everything by
// role and accessible name only (docs/contracts/component-library.md, Catalogue). Methods not yet
// needed by an implemented criterion return values that cannot pass (spec-003 tasks, T013).

import type { Locator, Page } from '@playwright/test';
import type { CatalogueSection, LibraryComponent, Sample } from '../../dsl/catalogue-vocabulary';
import { NO_BOX, readAppearance, readSampleView, readTypeface, textElement } from './catalogue-reading';
import type { CatalogueDriver, GridLayout, PublishedFile, SampleAppearance, SampleView, ScreenView } from '../catalogue.driver';
import type { Box } from '../phone.driver';
import { scanForAccessibilityProblems } from '../../support/axe';
import { publishedFiles } from '../published-files';

const CATALOGUE_PAGE = 'catalogue.html';
const CATALOGUE_TITLE = 'Operator component catalogue';
const CATALOGUE_SECTIONS: readonly CatalogueSection[] = ['Foundations', 'Simple components', 'Combined components', 'Screens'];


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

  async greyscaleContrast(): Promise<number> {
    return 0;
  }

  async greyscaleImage(): Promise<Uint8Array> {
    return new Uint8Array();
  }

  async builtFrom(): Promise<readonly LibraryComponent[]> {
    return [];
  }

  /** Requests since the page was created to any origin but the catalogue's own. */
  async requestsToOtherSites(): Promise<number> {
    const ownOrigin = new URL(this.page.url()).origin;
    return this.requestedUrls.filter((url) => /^https?:/.test(url) && new URL(url).origin !== ownOrigin).length;
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
