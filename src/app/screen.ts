// The play screen's props, worked out from the session: the only place game state becomes what the
// component library shows (spec-004 research R1). Pure; the library draws it.

import type { PlayScreenProps } from '../ui/screens/play-screen';
import type { Theme } from '../ui/foundations/themes';
import type { Features } from './features';
import { bubbleLine, pillName } from './labels';
import { lineOperator, lineSpec, type LinePosition, type LineWorking } from '../engine';
import type { TargetPillProps } from '../ui/combined/target-pill';
import { lineWorkings, type SessionState } from './session';

const TITLE = 'Hello, Operator!';

function lines(state: SessionState, axis: LinePosition['axis']): readonly LineWorking[] {
  return lineWorkings(state).filter((working) => working.line.axis === axis);
}

function pill({ puzzle, entry }: SessionState, working: LineWorking): TargetPillProps {
  return {
    target: lineSpec(puzzle, working.line)?.target ?? 0,
    operator: lineOperator(puzzle, entry, working.line),
    isOpen: lineSpec(puzzle, working.line)?.operator === 'open',
    name: pillName(puzzle, entry, working.line),
    reachesTarget: false,
  };
}

export function playScreenProps(state: SessionState, theme: Theme, _features: Features): PlayScreenProps {
  return {
    header: { title: TITLE, message: bubbleLine(state.message, theme) },
    counter: { found: state.found.size, total: state.puzzle.solutionCount },
    grid: {
      columnPills: lines(state, 'column').map((working) => pill(state, working)),
      rowPills: lines(state, 'row').map((working) => pill(state, working)),
      cells: [],
      rowWorkings: [],
      columnWorkings: [],
      helper: '',
    },
    mainButtonLabel: theme.buttonLabel,
  };
}
