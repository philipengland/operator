// What the catalogue shows: the component library by tier (spec-003 AC-1, contract
// docs/contracts/component-library.md).

import { builtFrom as confirmDialogParts } from '../ui/combined/confirm-dialog';
import { builtFrom as gridCellParts } from '../ui/combined/grid-cell';
import { builtFrom as keypadParts } from '../ui/combined/keypad';
import { builtFrom as lineWorkingParts } from '../ui/combined/line-working';
import { builtFrom as operatorHeaderParts } from '../ui/combined/operator-header';
import { builtFrom as puzzleGridParts } from '../ui/combined/puzzle-grid';
import { builtFrom as solutionsCounterParts } from '../ui/combined/solutions-counter';
import { builtFrom as speechBubbleParts } from '../ui/combined/speech-bubble';
import { builtFrom as statusBarParts } from '../ui/combined/status-bar';
import { builtFrom as targetPillParts } from '../ui/combined/target-pill';
import { builtFrom as workingsStripParts } from '../ui/combined/workings-strip';
import { builtFrom as playScreenParts } from '../ui/screens/play-screen';
import { builtFrom as solutionListParts } from '../ui/screens/solution-list';
import { builtFrom as solutionViewParts } from '../ui/screens/solution-view';
import { builtFrom as todayListParts } from '../ui/screens/today-list';

export type CatalogueSection = 'Foundations' | 'Simple components' | 'Combined components' | 'Screens';

export interface CatalogueEntry {
  readonly name: string;
  /** For combined components and screens: the components it is laid out from. */
  readonly builtFrom?: readonly string[];
}

const entries = (...names: readonly string[]): readonly CatalogueEntry[] => names.map((name) => ({ name }));

export const LIBRARY: Readonly<Record<CatalogueSection, readonly CatalogueEntry[]>> = {
  Foundations: [],
  'Simple components': entries('Text', 'Button', 'Text input', 'Icon', 'Surface', 'Badge', 'Mascot', 'Dialog'),
  'Combined components': [
    { name: 'Speech bubble', builtFrom: speechBubbleParts },
    { name: 'Operator header', builtFrom: operatorHeaderParts },
    { name: 'Solutions counter', builtFrom: solutionsCounterParts },
    { name: 'Target pill', builtFrom: targetPillParts },
    { name: 'Grid cell', builtFrom: gridCellParts },
    { name: 'Line working', builtFrom: lineWorkingParts },
    { name: 'Puzzle grid', builtFrom: puzzleGridParts },
    { name: 'Keypad', builtFrom: keypadParts },
    { name: 'Confirm dialog', builtFrom: confirmDialogParts },
    { name: 'Status bar', builtFrom: statusBarParts },
    { name: 'Workings strip', builtFrom: workingsStripParts },
  ],
  Screens: [
    { name: 'Play screen', builtFrom: playScreenParts },
    { name: 'Solution list', builtFrom: solutionListParts },
    { name: 'Solution view', builtFrom: solutionViewParts },
    { name: 'Today list', builtFrom: todayListParts },
  ],
};
