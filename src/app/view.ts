// The play screen (contracts/play-screen.md): builds the grid once, then writes each session
// state into it. Wording and names come from labels.ts; rules come from the engine.

import { lineSpec, type CellPosition, type LinePosition, type Puzzle } from '../engine';
import { cellName, lineName, operatorName } from './labels';
import { counterText, type SessionAction, type SessionState } from './session';

const NOT_CHOSEN_MARK = '?';

export interface PlayScreen {
  update(state: SessionState): void;
}

interface CellPart {
  readonly position: CellPosition;
  readonly button: HTMLButtonElement;
}

interface OperatorPart {
  readonly line: LinePosition;
  readonly button: HTMLButtonElement;
}

interface ScreenParts {
  readonly cells: readonly CellPart[];
  readonly operators: readonly OperatorPart[];
  readonly counter: HTMLElement;
}

export function createPlayScreen(
  root: HTMLElement,
  initial: SessionState,
  onAction: (action: SessionAction) => void,
): PlayScreen {
  const parts = build(root, initial.puzzle);
  for (const { position, button } of parts.cells) {
    button.addEventListener('click', () => onAction({ type: 'tapCell', ...position }));
  }
  const screen = { update: (state: SessionState) => render(parts, state) };
  screen.update(initial);
  return screen;
}

function build(root: HTMLElement, puzzle: Puzzle): ScreenParts {
  const cells: CellPart[] = [];
  const operators: OperatorPart[] = [];
  const grid = puzzleGroup(puzzle);

  grid.append(element('span', 'corner'));
  puzzle.columnLines.forEach((spec, index) => {
    grid.append(lineHeader({ axis: 'column', index }, spec.target, operators));
  });
  puzzle.rowLines.forEach((spec, row) => {
    grid.append(lineHeader({ axis: 'row', index: row }, spec.target, operators));
    for (let column = 0; column < puzzle.columns; column++) {
      const button = buttonElement('cell');
      cells.push({ position: { row, column }, button });
      grid.append(button);
    }
  });

  const counter = element('p', 'counter');
  root.replaceChildren(grid, statusRegion(counter), checkButton());
  return { cells, operators, counter };
}

function render(parts: ScreenParts, state: SessionState): void {
  parts.cells.forEach((cell) => renderCell(cell, state));
  parts.operators.forEach((operator) => renderOperator(operator, state));
  parts.counter.textContent = counterText(state);
}

function renderCell({ position, button }: CellPart, { puzzle, entry }: SessionState): void {
  const { row, column } = position;
  button.setAttribute('aria-label', cellName(puzzle, entry, position));
  button.textContent = String(puzzle.givens[row]?.[column] ?? entry.cells[row]?.[column] ?? '');
}

function renderOperator({ line, button }: OperatorPart, { puzzle, entry }: SessionState): void {
  const spec = lineSpec(puzzle, line);
  const shown = spec && spec.operator !== 'open' ? spec.operator : null;
  button.setAttribute('aria-label', operatorName(puzzle, entry, line));
  button.textContent = shown ?? NOT_CHOSEN_MARK;
  button.classList.toggle('open', shown === null);
  if (shown) {
    button.setAttribute('aria-disabled', 'true');
  }
}

function puzzleGroup(puzzle: Puzzle): HTMLElement {
  const grid = element('div', 'grid');
  grid.setAttribute('role', 'group');
  grid.setAttribute('aria-label', 'Puzzle');
  grid.style.setProperty('--columns', String(puzzle.columns));
  return grid;
}

/** A line's target and operator: to the left of a row, above a column. */
function lineHeader(line: LinePosition, target: number, operators: OperatorPart[]): HTMLElement {
  const header = element('div', `line-header ${line.axis}-header`);
  const button = buttonElement('operator');
  operators.push({ line, button });
  header.append(targetElement(line, target), button);
  return header;
}

function targetElement(line: LinePosition, target: number): HTMLElement {
  const wrapper = element('span', 'target');
  const hiddenName = element('span', 'visually-hidden');
  hiddenName.textContent = `${lineName(line)} target `;
  wrapper.append(hiddenName, String(target));
  return wrapper;
}

function statusRegion(counter: HTMLElement): HTMLElement {
  const status = element('div', 'status');
  status.setAttribute('role', 'status');
  status.append(counter);
  return status;
}

function checkButton(): HTMLButtonElement {
  const button = buttonElement('check');
  button.textContent = 'Check';
  return button;
}

function buttonElement(className: string): HTMLButtonElement {
  const button = element('button', className);
  button.type = 'button';
  return button;
}

function element<K extends keyof HTMLElementTagNameMap>(tag: K, className: string): HTMLElementTagNameMap[K] {
  const created = document.createElement(tag);
  created.className = className;
  return created;
}
