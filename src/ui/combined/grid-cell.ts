// Grid cell (combined component): a Button in the cell style, in one of five states
// (docs/contracts/component-library.md; data model "Grid cell model").

import type { Component } from '../component';
import { createButton } from '../simple/button';
import { gridCellModel, type GridCellProps } from './grid-cell.model';

export { gridCellModel, type GridCellProps } from './grid-cell.model';

/** The simple components this one is laid out from (spec-003 AC-7). */
export const builtFrom: readonly string[] = ['Button'];

/** A cell; `onTap` is called when the player taps a cell that is not given. */
export function createGridCell(props: GridCellProps, onTap?: () => void): Component<GridCellProps> {
  const button = createButton(gridCellModel(props), onTap);
  return { element: button.element, update: (next) => button.update(gridCellModel(next)) };
}
