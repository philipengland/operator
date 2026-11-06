// What the catalogue shows: the component library by tier (spec-003 AC-1, contract
// docs/contracts/component-library.md).

export type CatalogueSection = 'Foundations' | 'Simple components' | 'Combined components' | 'Screens';

export interface CatalogueEntry {
  readonly name: string;
  /** Shown in place of samples until the component is built (owner decision 2026-11-06). */
  readonly notBuiltYet?: string;
}

const entries = (...names: readonly string[]): readonly CatalogueEntry[] => names.map((name) => ({ name }));

// spec-003 is delivered in three pull requests; each placeholder goes when its part is built.
const builtIn =
  (part: string) =>
  (...names: readonly string[]): readonly CatalogueEntry[] =>
    names.map((name) => ({ name, notBuiltYet: `Built in ${part}.` }));

export const LIBRARY: Readonly<Record<CatalogueSection, readonly CatalogueEntry[]>> = {
  Foundations: [],
  'Simple components': entries('Text', 'Button', 'Text input', 'Icon', 'Surface', 'Badge', 'Mascot'),
  'Combined components': builtIn('part 2')(
    'Speech bubble',
    'Operator header',
    'Solutions counter',
    'Target pill',
    'Grid cell',
    'Line working',
    'Puzzle grid',
    'Keypad',
  ),
  Screens: builtIn('part 3')('Play screen'),
};
