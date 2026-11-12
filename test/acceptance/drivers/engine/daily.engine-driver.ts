// Layer 3 — today's puzzles in-process, with no browser (spec-007): the app's daily state and labels,
// played through the same game as the engine's game driver.

import { choose, onDate, openToday, todayRows, type Choice } from '../../../../src/app/daily';
import { puzzleName } from '../../../../src/app/labels';
import { applyAction, counterText, totalToShow, type SessionAction, type SessionState } from '../../../../src/app/session';
import { dailyPuzzle, type Entry, type Puzzle } from '../../../../src/engine';
import { solutionsCounterModel } from '../../../../src/ui/combined/solutions-counter.model';
import type { CalendarDay, DailyPuzzle, Preset, TodayChoice, TodayRow } from '../../dsl/daily-vocabulary';
import { dateText } from '../calendar';
import { firstSolutions } from '../daily-solutions';
import { puzzleView } from '../daily-view';
import type { DailyDriver } from '../daily.driver';
import { EngineGame } from './engine-game';

const CHOICES: Readonly<Record<TodayChoice, Choice>> = {
  Easy: 'easy',
  Medium: 'medium',
  Hard: 'hard',
  Collector: 'collector',
  Practice: 'practice',
};

const PRESET_NAMES: Readonly<Record<Preset, Choice & Puzzle['preset']>> = { Easy: 'easy', Medium: 'medium', Hard: 'hard', Collector: 'collector' };

// An open operator goes round the four when tapped (spec-001 FR-006).
const OPERATOR_TAPS_TO_GO_ROUND = 4;

function readOnlyOnThePhones(): never {
  throw new Error('Scenarios that read the screen are tagged @ui and run only with ACCEPTANCE_DRIVER=ui.');
}

export class EngineDailyDriver implements DailyDriver {
  constructor(private readonly game: EngineGame) {}

  async setDate(day: CalendarDay): Promise<void> {
    this.game.date = dateText(day);
  }

  /** The game reads the phone's date again as the Today screen opens (research R6). */
  async tapToday(): Promise<void> {
    this.game.daily = openToday(onDate(this.daily(), this.game.date));
  }

  async todayRows(): Promise<readonly TodayRow[]> {
    return todayRows(this.daily()).map((heardAs) => ({ choice: (heardAs.split(',')[0] ?? '') as TodayChoice, heardAs }));
  }

  async tapTodayRow(choice: TodayChoice): Promise<void> {
    this.game.daily = choose(this.daily(), CHOICES[choice]);
  }

  async puzzle(): Promise<DailyPuzzle> {
    const { puzzle, entry } = this.session();
    return puzzleView(puzzle, entry, puzzleName(puzzle));
  }

  async isWorkedExampleShowing(): Promise<boolean> {
    const { puzzle, place } = this.session();
    return puzzle.id === 'worked-example' && place.kind === 'play';
  }

  async counterTitle(): Promise<string> {
    const session = this.session();
    const total = totalToShow(session);
    return solutionsCounterModel(total === undefined ? { found: session.found.size } : { found: session.found.size, total }).title;
  }

  async counter(): Promise<string> {
    return counterText(this.session());
  }

  async enterBuiltFromFillingAndCheck(): Promise<void> {
    const { puzzle } = this.session();
    if (puzzle.preset === undefined) {
      throw new Error('The worked example was not made from a filling.');
    }
    this.enter(dailyPuzzle(this.daily().date, puzzle.preset).builtFrom);
    this.dispatch({ type: 'submit' });
  }

  /** Each of the first solutions the drivers' own search finds, entered as a player would and checked. */
  async enterSolutionsAndCheck(count: number): Promise<void> {
    for (const solution of firstSolutions(await this.puzzle(), count)) {
      this.enter(solution);
      this.dispatch({ type: 'submit' });
    }
  }

  async madeByTheEngineAlone(day: CalendarDay, preset: Preset): Promise<DailyPuzzle> {
    const { puzzle } = dailyPuzzle(dateText(day), PRESET_NAMES[preset]);
    return puzzleView(puzzle, null, `${preset} puzzle, ${puzzle.rows} by ${puzzle.columns}`);
  }

  themeShown = readOnlyOnThePhones;
  themeForThePuzzlesSeed = readOnlyOnThePhones;
  secondsToOpen = readOnlyOnThePhones;
  resultsBesideLines = readOnlyOnThePhones;

  /** As a player would: each empty cell tapped and its digit keyed, each open operator tapped round to the filling's. */
  private enter(filling: Entry): void {
    filling.cells.forEach((digits, row) =>
      digits.forEach((digit, column) => {
        if (digit !== null && this.session().puzzle.givens[row]?.[column] === null) {
          this.dispatch({ type: 'tapCell', row, column });
          this.dispatch({ type: 'key', digit });
        }
      }),
    );
    this.chooseOperators('row', filling.rowOperators);
    this.chooseOperators('column', filling.columnOperators);
  }

  private chooseOperators(axis: 'row' | 'column', operators: Entry['rowOperators']): void {
    operators.forEach((operator, index) => {
      for (let taps = 0; operator !== null && taps < OPERATOR_TAPS_TO_GO_ROUND && this.chosen(axis, index) !== operator; taps++) {
        this.dispatch({ type: 'tapOperator', line: { axis, index } });
      }
    });
  }

  private chosen(axis: 'row' | 'column', index: number) {
    const { entry } = this.session();
    return (axis === 'row' ? entry.rowOperators : entry.columnOperators)[index] ?? null;
  }

  private dispatch(action: SessionAction): void {
    this.game.session = applyAction(this.session(), action);
  }

  private daily() {
    if (this.game.daily === null) {
      throw new Error('Open the game first.');
    }
    return this.game.daily;
  }

  private session(): SessionState {
    return this.daily().session;
  }
}
