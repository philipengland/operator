// Play screen (screen): the operator header, solutions counter, puzzle grid, keypad and main
// button, top to bottom, inside the phone's safe areas (spec-003 FR-320; docs/contracts/component-library.md).

import './play-screen.css';
import type { Component } from '../component';
import { createKeypad, type KeypadValue } from '../combined/keypad';
import { createOperatorHeader } from '../combined/operator-header';
import { createPuzzleGrid, type PuzzleGridProps } from '../combined/puzzle-grid';
import { createSolutionsCounter, type SolutionsCounterProps } from '../combined/solutions-counter';
import type { SpeechBubbleProps } from '../combined/speech-bubble';
import { createButton } from '../simple/button';

/** The components this screen is laid out from (spec-003 AC-7). */
export const builtFrom: readonly string[] = ['Operator header', 'Solutions counter', 'Puzzle grid', 'Keypad', 'Button'];

// The main button checks the grid (spec-001 contract: the submit button is named "Check").
const MAIN_ACTION = 'Check';

export interface PlayScreenProps {
  readonly header: SpeechBubbleProps;
  readonly counter: SolutionsCounterProps;
  readonly grid: PuzzleGridProps;
  /** The main button's words, which come from the theme ("Put it through!"). */
  readonly mainButtonLabel: string;
}

/** What the player can do on the screen; spec-004 connects these to the game. */
export interface PlayScreenActions {
  readonly onKey?: (value: KeypadValue) => void;
  readonly onCheck?: () => void;
}

export function createPlayScreen(props: PlayScreenProps, actions: PlayScreenActions = {}): Component<PlayScreenProps> {
  const header = createOperatorHeader(props.header);
  const counter = createSolutionsCounter(props.counter);
  const grid = createPuzzleGrid(props.grid);
  const keypad = createKeypad(actions.onKey);
  const mainButton = createButton(mainButtonProps(props.mainButtonLabel), actions.onCheck);
  const element = document.createElement('div');
  element.className = 'play-screen';
  element.append(header.element, counter.element, grid.element, keypad.element, mainButton.element);
  const update = (next: PlayScreenProps): void => {
    header.update(next.header);
    counter.update(next.counter);
    grid.update(next.grid);
    mainButton.update(mainButtonProps(next.mainButtonLabel));
  };
  return { element, update };
}

function mainButtonProps(label: string) {
  return { label, style: 'main', action: MAIN_ACTION } as const;
}
