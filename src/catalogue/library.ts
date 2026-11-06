// What the catalogue shows: the component library by tier (spec-003 AC-1, contract
// docs/contracts/component-library.md).

export type CatalogueSection = 'Foundations' | 'Simple components' | 'Combined components' | 'Screens';

export interface CatalogueEntry {
  readonly name: string;
}

const entries = (...names: readonly string[]): readonly CatalogueEntry[] => names.map((name) => ({ name }));

export const LIBRARY: Readonly<Record<CatalogueSection, readonly CatalogueEntry[]>> = {
  Foundations: [],
  'Simple components': entries('Text', 'Button', 'Text input', 'Icon', 'Surface', 'Badge', 'Mascot'),
  'Combined components': entries(
    'Speech bubble',
    'Operator header',
    'Solutions counter',
    'Target pill',
    'Grid cell',
    'Line working',
    'Puzzle grid',
    'Keypad',
  ),
  Screens: entries('Play screen'),
};
