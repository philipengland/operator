// Layer 3 — the catalogue without a browser: only the game's published files can be read
// (spec-003 AC-18). Every scenario that browses the catalogue is tagged @ui and @catalogue.

import type { CatalogueDriver } from '../catalogue.driver';
import { publishedFiles } from '../published-files';

function browseOnlyWithTheUiDriver(): never {
  throw new Error('Browse the catalogue only with ACCEPTANCE_DRIVER=ui (scenarios tagged @catalogue).');
}

export const engineCatalogueDriver: CatalogueDriver = {
  publishedFiles: async () => publishedFiles(),
  open: browseOnlyWithTheUiDriver,
  sections: browseOnlyWithTheUiDriver,
  componentsIn: browseOnlyWithTheUiDriver,
  sample: browseOnlyWithTheUiDriver,
  appearance: browseOnlyWithTheUiDriver,
  typeface: browseOnlyWithTheUiDriver,
  typeInto: browseOnlyWithTheUiDriver,
  greyscaleContrast: browseOnlyWithTheUiDriver,
  greyscaleImage: browseOnlyWithTheUiDriver,
  builtFrom: browseOnlyWithTheUiDriver,
  requestsToOtherSites: browseOnlyWithTheUiDriver,
  gridLayout: browseOnlyWithTheUiDriver,
  keypadRows: browseOnlyWithTheUiDriver,
  mascotAndBubble: browseOnlyWithTheUiDriver,
  openScreen: browseOnlyWithTheUiDriver,
  chooseScreenSample: browseOnlyWithTheUiDriver,
  useScreen: browseOnlyWithTheUiDriver,
  screenView: browseOnlyWithTheUiDriver,
  chooseTheme: browseOnlyWithTheUiDriver,
  coloursInUse: browseOnlyWithTheUiDriver,
  layoutOfEverySample: browseOnlyWithTheUiDriver,
  accessibilityProblems: browseOnlyWithTheUiDriver,
};
