import { describe, expect, it } from 'vitest';
import { countSolutions } from './count-solutions';
import { workedExample } from './puzzles/worked-example';

const PLENTY_OF_WORK = 1_000_000;

describe('countSolutions', () => {
  it("counts the worked example's two solutions, within its budget", () => {
    expect(countSolutions(workedExample, PLENTY_OF_WORK)).toEqual({ count: 2, isWithinBudget: true });
  });
});
