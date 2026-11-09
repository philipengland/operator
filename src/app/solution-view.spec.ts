import { describe, expect, it } from 'vitest';
import type { Entry } from '../engine';
import { startSession, type SessionState } from './session';
import { solutionViewProps } from './solution-view';

const SOLUTION_A: Entry = { cells: [[null, 2], [2, 3]], rowOperators: [null, '×'], columnOperators: ['÷', null] };
const SOLUTION_B: Entry = { cells: [[null, 2], [3, 3]], rowOperators: [null, '+'], columnOperators: ['−', null] };
const FOUND: SessionState = { ...startSession(), solutions: [SOLUTION_A, SOLUTION_B] };

describe('solutionViewProps', () => {
  it('is headed by its number, with a way back (spec-006 AC-7)', () => {
    const { heading, backLabel } = solutionViewProps(FOUND, 1);

    expect({ heading, backLabel }).toEqual({ heading: 'Solution 1', backLabel: 'Back' });
  });

  it("shows that solution's digits and marks every line, not the grid in progress (spec-006 AC-7, AC-27)", () => {
    const { grid } = solutionViewProps(FOUND, 2);

    expect(grid.cells.flat().map((cell) => cell.digit)).toEqual([6, 2, 3, 3]);
    expect(grid.rowPills.map((pill) => pill.reachesTarget)).toEqual([true, true]);
  });
});
