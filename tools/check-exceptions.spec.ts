import { describe, expect, it } from 'vitest';
import { findExpiryProblems, type ExceptionRecord } from './check-exceptions';

const TODAY = '2027-11-02';

function exception(changes: Partial<ExceptionRecord>): ExceptionRecord {
  return { id: 'EXC-001', reviewBy: '2027-05-02', expires: '2027-11-02', ...changes };
}

describe('findExpiryProblems', () => {
  it('fails an exception whose expiry date has passed, naming it', () => {
    const problems = findExpiryProblems([exception({ id: 'EXC-002', expires: '2027-11-01' })], TODAY);

    expect(problems).toEqual(['EXC-002 expired on 2027-11-01']);
  });

  it.each(['2027-11-02', '2028-01-01'])('passes an exception that expires on %s, today or later', (expires) => {
    const problems = findExpiryProblems([exception({ expires })], TODAY);

    expect(problems).toEqual([]);
  });

  it('fails an exception whose review date is after its expiry date', () => {
    const problems = findExpiryProblems([exception({ id: 'EXC-005', reviewBy: '2028-01-01', expires: '2027-12-01' })], TODAY);

    expect(problems).toEqual(['EXC-005 is reviewed on 2028-01-01, after it expires on 2027-12-01']);
  });
});
