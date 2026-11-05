// The puzzle engine's public API (docs/contracts/engine-api.md). Nothing else in src/engine is
// imported from outside it.
export { nextCellValue, nextOperator } from './cycles';
export { checkEntry } from './check-entry';
export { emptyEntry, lineOperator } from './entry';
export { defaultRules, evaluateLine } from './evaluate-line';
export { isGiven, lineSpec } from './puzzle';
export { workedExample } from './puzzles/worked-example';
export type {
  CellPosition,
  CheckResult,
  Digit,
  Entry,
  LinePosition,
  LineResult,
  LineSpec,
  Operator,
  Puzzle,
  Rules,
  SolutionKey,
} from './types';
