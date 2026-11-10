// Play screen (screen): the operator header, solutions counter, puzzle grid, keypad and main
// button, top to bottom, inside the phone's safe areas (spec-003 FR-320; docs/contracts/component-library.md).

import './play-screen.css';
import { writeText, type Component } from '../component';
import { createKeypad, type KeypadValue } from '../combined/keypad';
import { createOperatorHeader } from '../combined/operator-header';
import { createPuzzleGrid, type PillAxis, type PuzzleGridProps } from '../combined/puzzle-grid';
import { createSolutionsCounter, type SolutionsCounterProps } from '../combined/solutions-counter';
import type { SpeechBubbleProps } from '../combined/speech-bubble';
import { createStatusBar } from '../combined/status-bar';
import { createWorkingsStrip, type WorkingsStripProps } from '../combined/workings-strip';
import { createButton } from '../simple/button';
import { headerWithAnnouncement, playScreenParts } from './play-screen.model';

/** The components this screen is laid out from (spec-003 AC-7). */
export const builtFrom: readonly string[] = [
  'Operator header',
  'Solutions counter',
  'Status bar',
  'Puzzle grid',
  'Workings strip',
  'Keypad',
  'Button',
];

const NOTHING_IN_THE_STRIP: WorkingsStripProps = { text: '' };

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
  /** spec-007 FR-719: the compact screen, for grids bigger than 3 × 3. Fixed once shown. */
  readonly isCompact?: boolean;
  /** What the compact screen's Workings strip shows. */
  readonly strip?: WorkingsStripProps;
}

/** What the player can do on the screen; spec-004 connects these to the game. */
export interface PlayScreenActions {
  readonly onKey?: (value: KeypadValue) => void;
  readonly onCheck?: () => void;
  readonly onCell?: (row: number, column: number) => void;
  readonly onPill?: (axis: PillAxis, index: number) => void;
  /** Given only when the counter can be tapped (spec-006 FR-601). */
  readonly onCounter?: () => void;
  /** Given only when there are daily puzzles to go to (spec-007 FR-701): adds the Today button. */
  readonly onToday?: () => void;
}

export interface PlayScreenComponent extends Component<PlayScreenProps> {
  focusCounter(): void;
}

export function createPlayScreen(props: PlayScreenProps, actions: PlayScreenActions = {}): PlayScreenComponent {
  const parts = playScreenParts({ isCompact: props.isCompact ?? false, hasToday: actions.onToday !== undefined });
  const header = createOperatorHeader(headerWithAnnouncement(props.header, props.announcement ?? ''));
  const counter = createCounterPart(parts.statusBar, props.counter, actions);
  const grid = createPuzzleGrid(props.grid, actions);
  const strip = createWorkingsStrip(props.strip ?? NOTHING_IN_THE_STRIP);
  const keypad = createKeypad(actions.onKey, props.keysAvailable);
  const mainButton = createButton(mainButtonProps(props.mainButtonLabel), actions.onCheck);
  const element = document.createElement('div');
  element.className = props.isCompact ? 'play-screen play-screen--compact' : 'play-screen';
  // One polite region for what a check says; it exists from the start so new text is announced.
  const status = document.createElement('div');
  status.setAttribute('role', 'status');
  status.className = 'visually-hidden';
  element.append(
    ...(parts.header ? [header.element] : []),
    counter.element,
    grid.element,
    ...(parts.strip ? [strip.element] : []),
    keypad.element,
    mainButton.element,
    status,
  );
  keypad.element.hidden = props.isKeypadShown === false;
  writeText(status, props.announcement ?? '');
  const update = (next: PlayScreenProps): void => {
    header.update(headerWithAnnouncement(next.header, next.announcement ?? ''));
    counter.update(next.counter);
    grid.update(next.grid);
    strip.update(next.strip ?? NOTHING_IN_THE_STRIP);
    keypad.update(next.keysAvailable ?? true);
    keypad.element.hidden = next.isKeypadShown === false;
    mainButton.update(mainButtonProps(next.mainButtonLabel));
    writeText(status, next.announcement ?? '');
  };
  return { element, update, focusCounter: counter.focus };
}

interface CounterPart extends Component<SolutionsCounterProps> {
  focus(): void;
}

/** The counter alone, or the Status bar: the counter with the Today button beside it (spec-007). */
function createCounterPart(isInStatusBar: boolean, props: SolutionsCounterProps, actions: PlayScreenActions): CounterPart {
  if (!isInStatusBar) {
    const counter = createSolutionsCounter(props, actions.onCounter);
    return { ...counter, focus: () => counter.element.focus() };
  }
  const bar = createStatusBar({ counter: props }, actions);
  // The counter itself is the Status bar's first part.
  return { element: bar.element, update: (next) => bar.update({ counter: next }), focus: () => (bar.element.firstElementChild as HTMLElement).focus() };
}

function mainButtonProps(label: string) {
  return { label, style: 'main', action: MAIN_ACTION } as const;
}
