---
description: Test-driven development — red-green-refactor inner loop inside the acceptance-test outer loop, for every behaviour change including bug fixes
paths:
- '**/*.cs'
- '**/*.ts'
- '**/*.feature'
---
<!-- engineering-standards v2.0.0: managed file — do not edit in this repository. Changes go to the engineering-standards repo. -->

# Test-Driven Development

Every behaviour change is written test-first. `/speckit.implement` applies
the full protocol (outer and inner loops, narration, TDD log, checkpoints).
This standard applies the same discipline to work done outside it, such as
bug fixes and small changes.
`[Quality]`

## The Loops

```
OUTER — per acceptance criterion
  Approved acceptance scenarios (locked) → RED
  INNER — repeat until the acceptance test passes
    RED       one unit test → fails on its assertion
    GREEN     smallest code to pass → tests green (in-progress acceptance test may still be red)
    REFACTOR  improve code and test → still green
  Acceptance test → GREEN → refactor the slice → full suite green
```

## Acceptance Scenarios

The outer loop runs the human-approved executable specifications (see the
acceptance-tests standard). Never write, edit or delete them during
implementation; if one looks wrong, stop and ask.

## RED

- One new failing test at a time. No production code in this step.
- If the code under test does not exist, add a stub that compiles and returns
  a default value — never one that throws "not implemented".
- Run it. It must fail **on its assertion, for the expected reason**. A
  compile error or a stub exception is not a valid red.
- A test that passes on its first run is not a valid red: either the
  behaviour already exists or the test is wrong. Find out which.

## GREEN

- Write the smallest production change that passes the test. Do not add
  behaviour no test asks for.
- Never edit the test to make it pass. If the test is wrong, go back to RED.
- Commit test and code together (`feat:` / `fix:`).

## REFACTOR

- Only with all tests green. Improve production code and tests: duplication,
  naming in domain language, coding principles. No behaviour change.
- Re-run the tests, then commit separately (`refactor:`).

## Bug Fixes

Start with a failing **unit or integration** test that reproduces the bug at
the lowest level that can show it, watch it fail, then fix it. The test stays
as a regression guard. If the bug shows that an acceptance scenario is missing
or wrong, **propose** the new or corrected scenario for human approval — never
add or change an acceptance scenario yourself.

## Explain As You Go

When an agent works test-first, it states for each phase: the test or change,
the command it ran, and the result — including the exact failure message at
RED.
