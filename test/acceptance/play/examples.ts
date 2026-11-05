// Layer 1 — the examples from spec-001's "Acceptance Criteria as Examples" table.

import type { Entry } from '../dsl/vocabulary';

export const solutionA: Entry = { topRight: 2, bottomLeft: 2, bottomRight: 3, row2: '×', column1: '÷' };

export const solutionB: Entry = { topRight: 2, bottomLeft: 3, bottomRight: 3, row2: '+', column1: '−' };

/** Row 2 gives 9 − 3 = 6, but Column 1 gives 6 − 9, which goes below zero. */
export const belowZero: Entry = { topRight: 2, bottomLeft: 9, bottomRight: 3, row2: '−', column1: '−' };

/** Column 1 gives 6 ÷ 4, which is not a whole number. */
export const inexactDivision: Entry = { topRight: 2, bottomLeft: 4, bottomRight: 3, row2: '+', column1: '÷' };

export const bottomRightEmpty: Entry = { topRight: 2, bottomLeft: 2, bottomRight: 'empty', row2: '×', column1: '÷' };

export const column1NotChosen: Entry = { topRight: 2, bottomLeft: 2, bottomRight: 3, row2: '×', column1: 'not chosen' };
