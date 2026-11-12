// Puzzle grid (combined component): the whole puzzle on a panel Surface — column Target pills along
// the top, row pills down the left, Grid cells between, each Line working at its far end, and a
// helper line of body Text (docs/contracts/component-library.md). A group named "Puzzle".

import './puzzle-grid.css';
import type { Component } from '../component';
import { createSurface } from '../simple/surface';
import { createText } from '../simple/text';
import { createGridCell, type GridCellProps } from './grid-cell';
import { createLineWorking, type LineWorkingProps } from './line-working';
import { areColumnPillsStacked, puzzleGridPlaces, type GridPlace, type WorkingsPlace } from './puzzle-grid.model';
import { createTargetPill, type TargetPillProps } from './target-pill';

/** The components this one is laid out from (spec-003 AC-7). */
export const builtFrom: readonly string[] = ['Surface', 'Target pill', 'Grid cell', 'Line working', 'Text'];

export interface PuzzleGridProps {
  readonly columnPills: readonly TargetPillProps[];
  readonly rowPills: readonly TargetPillProps[];
  /** Cells by row, then column. */
  readonly cells: readonly (readonly GridCellProps[])[];
  readonly rowWorkings: readonly LineWorkingProps[];
  readonly columnWorkings: readonly LineWorkingProps[];
  readonly helper: string;
  /** What a screen reader calls the puzzle: "Puzzle" (the default), or "Easy puzzle, 3 by 3" (spec-007 FR-717). */
  readonly name?: string;
  /** spec-007 FR-718: workings beside their lines (the default), or kept only for screen readers. */
  readonly workings?: WorkingsPlace;
}

/** Which kind of line an operator pill belongs to. */
export type PillAxis = 'row' | 'column';

/** What the player can do on the grid. A given cell and a shown pill send nothing. */
export interface PuzzleGridActions {
  readonly onCell?: (row: number, column: number) => void;
  readonly onPill?: (axis: PillAxis, index: number) => void;
}

/** The puzzle's size and lines are fixed once it is shown; `update` shows new states of the same parts. */
export function createPuzzleGrid(props: PuzzleGridProps, actions: PuzzleGridActions = {}): Component<PuzzleGridProps> {
  const places = puzzleGridPlaces({ rows: props.rowPills.length, columns: props.columnPills.length }, props.workings);
  const grid = document.createElement('div');
  grid.className = props.workings === 'elsewhere' ? 'puzzle-grid__grid puzzle-grid__grid--workings-elsewhere' : 'puzzle-grid__grid';
  grid.style.setProperty('--columns', String(props.columnPills.length));
  // Workings shown elsewhere are heard here, from one visually hidden holder that takes no room.
  const heardOnly = document.createElement('div');
  heardOnly.className = 'visually-hidden';
  const isStacked = areColumnPillsStacked(props.columnPills.length);
  const columnPills = props.columnPills.map((pill, column) =>
    placed(grid, createTargetPill({ ...pill, isStacked }, () => actions.onPill?.('column', column)), places.columnPill(column)),
  );
  const rowPills = props.rowPills.map((pill, row) => placed(grid, createTargetPill(pill, () => actions.onPill?.('row', row)), places.rowPill(row)));
  const cells = props.cells.map((cellsInRow, row) =>
    cellsInRow.map((cell, column) => placed(grid, createGridCell(cell, () => actions.onCell?.(row, column)), places.cell(row, column))),
  );
  const rowWorkings = props.rowWorkings.map((working, row) => placed(grid, createLineWorking(working), places.rowWorking(row), heardOnly));
  const columnWorkings = props.columnWorkings.map((working, column) => {
    const part = createLineWorking(working);
    part.element.classList.add('puzzle-grid__column-working');
    return placed(grid, part, places.columnWorking(column), heardOnly);
  });
  if (heardOnly.childElementCount > 0) {
    grid.append(heardOnly);
  }
  const helper = createHelperLine(props.helper);
  const surface = createSurface({ variant: 'panel' }, [grid, helper.element]);
  surface.element.setAttribute('role', 'group');
  surface.element.setAttribute('aria-label', props.name ?? 'Puzzle');
  const update = (next: PuzzleGridProps): void => {
    next.columnPills.forEach((pill, column) => columnPills[column]?.update({ ...pill, isStacked }));
    next.rowPills.forEach((pill, row) => rowPills[row]?.update(pill));
    next.cells.forEach((cellsInRow, row) => cellsInRow.forEach((cell, column) => cells[row]?.[column]?.update(cell)));
    next.rowWorkings.forEach((working, row) => rowWorkings[row]?.update(working));
    next.columnWorkings.forEach((working, column) => columnWorkings[column]?.update(working));
    helper.update(next.helper);
  };
  return { element: surface.element, update };
}

/** The helper line under the grid: a paragraph of body Text. */
function createHelperLine(text: string): Component<string> {
  const words = createText({ text, style: 'body' });
  const element = document.createElement('p');
  element.className = 'puzzle-grid__helper';
  element.append(words.element);
  element.hidden = text === '';
  const update = (next: string): void => {
    words.update({ text: next, style: 'body' });
    element.hidden = next === '';
  };
  return { element, update };
}

/** Adds a part to the grid at its place, and returns it. A part with no place goes to `heardOnly`. */
function placed<Props>(grid: HTMLElement, part: Component<Props>, place: GridPlace | null, heardOnly?: HTMLElement): Component<Props> {
  if (place === null) {
    heardOnly?.append(part.element);
    return part;
  }
  part.element.style.gridRow = String(place.row);
  part.element.style.gridColumn = String(place.column);
  grid.append(part.element);
  return part;
}
