// Layer 1 — spec-004 User Story 3: the operator talks to the player. The Midnight blue wording
// (AC-19) is proved by unit tests, as players see only Classic until F7; see
// specs/004-themed-play-screen/acceptance.md.

import { test } from '../support/acceptance';
import { bottomRightEmpty, inexactDivision, solutionA, solutionB } from './examples';

const PHONES = { tag: '@ui' };

test.describe('[spec-004 AC-15] the greeting', PHONES, () => {
  test('the bubble says "Hello, Operator!" and "Fill the grid, pal.", and nothing is announced', async ({ game }) => {
    await game.open();

    await game.expectBubble('Hello, Operator!', 'Fill the grid, pal.');
    await game.expectNothingAnnounced();
    await game.expectAnnouncementsStillAt(0);
  });
});

test.describe("[spec-004 AC-16] the result of a check, in the operator's voice", PHONES, () => {
  test("Solution A: \"You're connected! Keep 'em coming, pal!\", announced once with spec-001's words first", async ({ game }) => {
    await game.open();

    await game.fillInAndCheck(solutionA);

    await game.expectBubble('Hello, Operator!', "You're connected! Keep 'em coming, pal!");
    await game.expectAnnounced("New solution found! You're connected! Keep 'em coming, pal! Found 1 of 2");
    await game.expectAnnouncementsStillAt(1);
  });

  test('Solution B after A: "Every line connected, pal!", announced with the count', async ({ game }) => {
    await game.open();
    await game.fillInAndCheck(solutionA);

    await game.fillInAndCheck(solutionB);

    await game.expectBubble('Hello, Operator!', 'Every line connected, pal!');
    await game.expectAnnounced("New solution found! You've found every solution. Every line connected, pal! Found 2 of 2");
  });

  test("Solution A again: \"We've had that call, pal.\", with no count, as the count has not changed", async ({ game }) => {
    await game.open();
    await game.fillInAndCheck(solutionA);

    await game.check();

    await game.expectBubble('Hello, Operator!', "We've had that call, pal.");
    await game.expectAnnounced("You've already found this solution. We've had that call, pal.");
  });

  test("bottom-right empty: \"Line's busy, pal: fill every cell and operator first.\"", async ({ game }) => {
    await game.open();

    await game.fillInAndCheck(bottomRightEmpty);

    await game.expectBubble('Hello, Operator!', "Line's busy, pal: fill every cell and operator first.");
    await game.expectAnnounced("Fill every cell and choose every operator before checking. Line's busy, pal: fill every cell and operator first.");
  });
});

test.describe('[spec-004 AC-17] a grid that is not a solution', PHONES, () => {
  test('the inexact division: "Wrong number, pal!", heard as "Not solved yet. Wrong number, pal!"', async ({ game }) => {
    await game.open();

    await game.fillInAndCheck(inexactDivision);

    await game.expectBubble('Hello, Operator!', 'Wrong number, pal!');
    await game.expectAnnounced('Not solved yet. Wrong number, pal!');
  });
});

test.describe('[spec-004 AC-18] the message goes once the grid changes', PHONES, () => {
  test('tapping bottom-left after "Wrong number, pal!" returns to the greeting, and nothing is announced', async ({ game }) => {
    await game.open();
    await game.fillInAndCheck(inexactDivision);
    await game.expectAnnouncementsStillAt(1);

    await game.tapCell('bottom-left');

    await game.expectBubble('Hello, Operator!', 'Fill the grid, pal.');
    await game.expectNothingAnnounced();
    await game.expectAnnouncementsStillAt(1);
  });
});
