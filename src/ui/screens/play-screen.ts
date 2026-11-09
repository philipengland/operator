// Play screen (screen): the operator header, solutions counter, puzzle grid, keypad and main
// button, top to bottom, inside the phone's safe areas (spec-003 FR-320; docs/contracts/component-library.md).

import './play-screen.css';
import { writeText, type Component } from '../component';
import { createKeypad, type KeypadValue } from '../combined/keypad';
import { createOperatorHeader } from '../combined/operator-header';
import { createPuzzleGrid, type PillAxis, type PuzzleGridProps } from '../combined/puzzle-grid';
import { createSolutionsCounter, type SolutionsCounterProps } from '../combined/solutions-counter';
import type { SpeechBubbleProps } from '../combined/speech-bubble';
import { createButton } from '../simple/button';
import { headerWithAnnouncement } from './play-screen.model';

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
  /** False leaves the keypad off the screen (spec-004 FR-413). */
  readonly isKeypadShown?: boolean;
  /** Whether the keys can be used yet (spec-004 FR-405). */
  readonly keysAvailable?: boolean;
  /** What a screen reader is told after a check; empty for nothing (spec-004 FR-409). */
  readonly announcement?: string;
}

/** What the player can do on the screen; spec-004 connects these to the game. */
export interface PlayScreenActions {
  readonly onKey?: (value: KeypadValue) => void;
  readonly onCheck?: () => void;
  readonly onCell?: (row: number, column: number) => void;
  readonly onPill?: (axis: PillAxis, index: number) => void;
  /** Given only when the counter can be tapped (spec-006 FR-601). */
  readonly onCounter?: () => void;
}

export function createPlayScreen(props: PlayScreenProps, actions: PlayScreenActions = {}): Component<PlayScreenProps> {
  const header = createOperatorHeader(headerWithAnnouncement(props.header, props.announcement ?? ''));
  const counter = createSolutionsCounter(props.counter, actions.onCounter);
  const grid = createPuzzleGrid(props.grid, actions);
  const keypad = createKeypad(actions.onKey, props.keysAvailable);
  const mainButton = createButton(mainButtonProps(props.mainButtonLabel), actions.onCheck);
  const element = document.createElement('div');
  element.className = 'play-screen';
  // One polite region for what a check says; it exists from the start so new text is announced.
  const status = document.createElement('div');
  status.setAttribute('role', 'status');
  status.className = 'visually-hidden';
  element.append(header.element, counter.element, grid.element, keypad.element, mainButton.element, status);
  keypad.element.hidden = props.isKeypadShown === false;
  writeText(status, props.announcement ?? '');
  const update = (next: PlayScreenProps): void => {
    header.update(headerWithAnnouncement(next.header, next.announcement ?? ''));
    counter.update(next.counter);
    grid.update(next.grid);
    keypad.update(next.keysAvailable ?? true);
    keypad.element.hidden = next.isKeypadShown === false;
    mainButton.update(mainButtonProps(next.mainButtonLabel));
    writeText(status, next.announcement ?? '');
  };
  return { element, update };
}

function mainButtonProps(label: string) {
  return { label, style: 'main', action: MAIN_ACTION } as const;
}
