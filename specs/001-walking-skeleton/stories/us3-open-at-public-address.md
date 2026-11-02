# User Story 3 - Anyone can open the game at a public address (Priority: P3)

**Feature**: [Walking Skeleton (F0)](../spec.md)

> **Master copy**: the acceptance criteria below are copied from [spec.md](../spec.md),
> which is the source of truth. A change to a criterion must be made in both files.

> **As a** playtester trying out the game,
> **I want to** open the latest version on my phone from a web link, with nothing to install,
> **So that** I can try each new change as soon as it is ready and say what I think.

Every change merged to the main line is built and published by the pipeline to a public web
address. A stakeholder or playtester opens that address on their phone and plays the latest
version, with nothing to install.

**Why this priority**: a walking skeleton proves the route to players works, not just the code.
Later features ship through the same route.

**Independent Test**: merge a visible change, then open the public address on a phone and see
that change without anyone deploying by hand.

## Acceptance Scenarios

1. **AC-17** — **Given** a change is merged to the main line, **When** the pipeline finishes,
   **Then** the public address serves the new version, with no manual step.
2. **AC-18** — **Given** the game has loaded on a phone, **When** the phone loses its
   connection, **Then** the player can still fill the grid, submit and see the counter update.
3. **AC-19** — **Given** the pipeline fails to build or test a change, **When** it stops,
   **Then** the public address keeps serving the previous version.
4. **AC-21** — **Given** the game has been opened once on a phone and the phone now has no
   connection, **When** the player reloads the page, **Then** the game does not load.
