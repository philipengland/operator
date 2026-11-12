// The large grids' play screen samples (spec-007 FR-713, FR-718, FR-719; research R9): a Medium-shaped
// 5 × 4 grid and a Hard-shaped 7 × 5 grid, just opened, with the full header and the widest pills each
// preset can show. Fixed examples only, to prove the screen fits; they are not real daily puzzles.
// Names follow the play-screen contract.

import type { GridCellProps } from '../ui/combined/grid-cell';
import type { LineWorkingProps } from '../ui/combined/line-working';
import type { PuzzleGridProps } from '../ui/combined/puzzle-grid';
import type { TargetOperator, TargetPillProps } from '../ui/combined/target-pill.model';
import type { Theme } from '../ui/foundations/themes';
import type { PlayScreenProps } from '../ui/screens/play-screen';

export type CompactSampleName = 'Medium, 5 by 4' | 'Hard, 7 by 5';

const OPERATOR_NAMES: Readonly<Record<TargetOperator, string>> = { '+': 'plus', '−': 'minus', '×': 'times', '÷': 'divide' };

/** As the player reads them: a line's pill, "× 96" or "? 3" when open; a row of cells, "7·9·", "·" to fill. */
interface GridSample {
  readonly rows: readonly string[];
  readonly columns: readonly string[];
  readonly cells: readonly string[];
  /** The widest result beside a line in short form (FR-718), shown on the first row. */
  readonly widestResult: string;
}

const MEDIUM: GridSample = {
  rows: ['+ 24', '× 96', '? 3', '× 72', '? 18'],
  columns: ['+ 100', '? 5', '× 80', '? 2'],
  cells: ['7·9·', '·4·3', '8··1', '·26·', '5·4·'],
  widestResult: '4536',
};

// The widest pills Hard can show: "× −500" is the widest within its range (research R9).
const HARD: GridSample = {
  rows: ['− −480', '+ 27', '× 378', '÷ 2', '? −26', '+ 35', '− −31'],
  columns: ['× −500', '× 432', '+ 41', '? 3', '− −20'],
  cells: ['98·76', '4··53', '·769·', '8·1·2', '2·8·7', '·7·39', '19··5'],
  widestResult: '27216',
};

const OPEN = '?';
const EMPTY = '·';

export const COMPACT_SAMPLES: Readonly<Record<CompactSampleName, GridSample>> = { 'Medium, 5 by 4': MEDIUM, 'Hard, 7 by 5': HARD };

const HARD_ROWS = 7;

/** The large grid's play screen with this sample's grid, just opened, in the theme's voice. */
export function compactScreenSample(name: CompactSampleName, { buttonLabel, address }: Theme): PlayScreenProps {
  const sample = COMPACT_SAMPLES[name];
  return {
    header: { title: 'Hello, Operator!', message: `Fill the grid, ${address}.` },
    counter: { found: 0, total: 3 },
    grid: gridOf(sample),
    mainButtonLabel: buttonLabel,
    keysAvailable: false,
    isLargeGrid: true,
    isTallGrid: sample.rows.length >= HARD_ROWS,
  };
}

function gridOf({ rows, columns, cells, widestResult }: GridSample): PuzzleGridProps {
  return {
    columnPills: columns.map((line, index) => pill('Column', index, line)),
    rowPills: rows.map((line, index) => pill('Row', index, line)),
    cells: cells.map((digits, row) => [...digits].map((digit, column) => cell(row, column, digit))),
    rowWorkings: rows.map((_, index) => working('Row', index, index === 0 ? widestResult : OPEN)),
    columnWorkings: columns.map((_, index) => working('Column', index, OPEN)),
    helper: '',
  };
}

function pill(axis: 'Row' | 'Column', index: number, shown: string): TargetPillProps {
  const [symbol = OPEN, written = ''] = shown.split(' ');
  const operator = symbol === OPEN ? null : (symbol as TargetOperator);
  const target = Number(written.replace('−', '-'));
  const said = operator === null ? 'operator not chosen' : OPERATOR_NAMES[operator];
  return { target, operator, isOpen: operator === null, name: `${axis} ${index + 1} target ${written}, ${said}` };
}

function cell(row: number, column: number, shown: string): GridCellProps {
  const name = `Row ${row + 1} column ${column + 1} cell`;
  return shown === EMPTY ? { name, digit: null } : { name, digit: Number(shown), isGiven: true };
}

function working(axis: 'Row' | 'Column', index: number, result: string): LineWorkingProps {
  return { result, mark: 'none', name: `${axis} ${index + 1} working, ${result === OPEN ? 'incomplete' : result}` };
}
