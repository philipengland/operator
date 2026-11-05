// The play screen (docs/contracts/play-screen.md): builds the grid once, then writes each session
// state into it. Wording and names come from labels.ts; rules come from the engine.

import { isGiven, lineOperator, lineSpec, type CellPosition, type LinePosition, type Puzzle } from '../engine';
import { cellName, lineName, messageText, operatorName, resultText, workingName } from './labels';
import { counterText, lineWorkings, type SessionAction, type SessionState } from './session';

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

/** A line's working: its name for screen readers, and the result slot the player sees. */
interface WorkingPart {
  readonly line: LinePosition;
  readonly name: HTMLElement;
  readonly result: HTMLElement;
}

interface ScreenParts {
  readonly cells: readonly CellPart[];
  readonly operators: readonly OperatorPart[];
  readonly workings: readonly WorkingPart[];
  readonly message: HTMLElement;
  readonly counter: HTMLElement;
  readonly check: HTMLButtonElement;
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
  for (const { line, button } of parts.operators) {
    button.addEventListener('click', () => onAction({ type: 'tapOperator', line }));
  }
  parts.check.addEventListener('click', () => onAction({ type: 'submit' }));
  const screen = { update: (state: SessionState) => render(parts, state) };
  screen.update(initial);
  return screen;
}

function build(root: HTMLElement, puzzle: Puzzle): ScreenParts {
  const cells: CellPart[] = [];
  const operators: OperatorPart[] = [];
  const workings: WorkingPart[] = [];
  const grid = puzzleGroup(puzzle);

  grid.append(element('span', 'corner'));
  puzzle.columnLines.forEach((spec, index) => {
    grid.append(lineHeader({ axis: 'column', index }, spec.target, operators));
  });
  grid.append(element('span', 'corner'));
  puzzle.rowLines.forEach((spec, row) => {
    grid.append(lineHeader({ axis: 'row', index: row }, spec.target, operators));
    for (let column = 0; column < puzzle.columns; column++) {
      const button = buttonElement('cell');
      cells.push({ position: { row, column }, button });
      grid.append(button);
    }
    grid.append(workingElement({ axis: 'row', index: row }, workings));
  });
  grid.append(element('span', 'corner'));
  puzzle.columnLines.forEach((_, index) => {
    grid.append(workingElement({ axis: 'column', index }, workings));
  });

  const message = element('p', 'message');
  const counter = element('p', 'counter');
  const check = checkButton();
  root.replaceChildren(grid, statusRegion(message, counter), check);
  return { cells, operators, workings, message, counter, check };
}

function render(parts: ScreenParts, state: SessionState): void {
  parts.cells.forEach((cell) => renderCell(cell, state));
  parts.operators.forEach((operator) => renderOperator(operator, state));
  renderWorkings(parts.workings, state);
  writeText(parts.message, state.message ? messageText(state.message) : '');
  writeText(parts.counter, counterText(state));
}

/**
 * Rewriting unchanged text in a live region can make screen readers announce it again, so
 * text is only written when it changes. Clearing a message removes text, which is not
 * announced (FR-014).
 */
function writeText(target: HTMLElement, text: string): void {
  if (target.textContent !== text) {
    target.textContent = text;
  }
}

function renderCell({ position, button }: CellPart, { puzzle, entry }: SessionState): void {
  const { row, column } = position;
  const given = isGiven(puzzle, position);
  button.classList.toggle('given', given);
  if (given) {
    button.setAttribute('aria-disabled', 'true');
  }
  button.setAttribute('aria-label', cellName(puzzle, entry, position));
  button.textContent = String(puzzle.givens[row]?.[column] ?? entry.cells[row]?.[column] ?? '');
}

function renderOperator({ line, button }: OperatorPart, { puzzle, entry }: SessionState): void {
  const isOpen = lineSpec(puzzle, line)?.operator === 'open';
  button.setAttribute('aria-label', operatorName(puzzle, entry, line));
  button.textContent = lineOperator(puzzle, entry, line) ?? NOT_CHOSEN_MARK;
  button.classList.toggle('open', isOpen);
  if (!isOpen) {
    button.setAttribute('aria-disabled', 'true');
  }
}

/** The working is read from its name, not announced: it is not in a live region (spec-002 FR-206). */
function renderWorkings(parts: readonly WorkingPart[], state: SessionState): void {
  for (const working of lineWorkings(state)) {
    const part = parts.find(({ line }) => line.axis === working.line.axis && line.index === working.line.index);
    if (part) {
      writeText(part.name, workingName(working));
      writeText(part.result, resultText(working));
    }
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

/** A line's result slot: right of a row, below a column. The visible slot is hidden from screen readers, which read the name. */
function workingElement(line: LinePosition, workings: WorkingPart[]): HTMLElement {
  const wrapper = element('span', `working ${line.axis}-working`);
  const name = element('span', 'visually-hidden');
  const result = element('span', 'result');
  result.setAttribute('aria-hidden', 'true');
  workings.push({ line, name, result });
  wrapper.append(name, result);
  return wrapper;
}

/** One polite live region, so a new message and the counter are announced together. */
function statusRegion(message: HTMLElement, counter: HTMLElement): HTMLElement {
  const status = element('div', 'status');
  status.setAttribute('role', 'status');
  status.append(message, counter);
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
