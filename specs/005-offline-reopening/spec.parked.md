# Feature Specification: Reopening the Game with No Connection

> **Parked by the owner, 2026-11-08. Not planned, and nothing here has been built.** The store apps
> (F13) carry the game inside the app, so they open with no connection without this. It would only
> help people playing in a browser. Nothing in this document changes an earlier spec: spec-001 FR-016
> and AC-21 stand. Pick it up only if the browser stays a real way to play after launch, or F13 is a
> long way off.

**Feature Branch**: `005-offline-reopening`

**Created**: 2026-11-08

**Status**: Parked (see above). Named `spec.parked.md` so `npm run test-results` does not treat it as a feature.

**Input**: Owner decision during spec-004, 2026-11-08: "Make it work offline", as its own
spec straight after spec-004. Reverses spec-001's decision and locked AC-21, and needs rules for
updates and rollback.

## Context

This feature builds on specs [001](../001-walking-skeleton/spec.md),
[002](../002-live-calculations/spec.md), [003](../003-themed-ui/spec.md) and
[004](../004-themed-play-screen/spec.md). Everything in them still holds unless this spec says
otherwise. It plays the same fixed 2 × 2 puzzle on the same screen.

**User need (Overlay P1).** Operator is a game for odd moments, including ones with no signal: on
the Underground, on a plane, in a weak spot. Today a game already open keeps working when the
connection drops, but reloading or reopening it shows the browser's "no connection" page. The
brief promises a game that "works fully offline". Evidence: the owner found this gap while reviewing
spec-004 on a phone. The store apps (F13) will open offline, but they are some way off, and the
browser game is what players have now.

**The risk this spec exists to manage.** A copy of the game kept on a phone can go on running
after the public address has moved on. spec-001 refused to keep a copy for that reason. So this
spec sets out how a saved copy is updated and how it is withdrawn, not only how it is made.

### Release order (constitution VII)

Every merge to `main` deploys, so each step below is fit for players and goes live on its own.

| Release | What players get | Flag |
| --- | --- | --- |
| 1. User Story 1: reopening | No change | `offline`, off |
| 2. User Story 2: updates | No change | `offline`, off |
| 3. User Story 3: withdrawing a copy | No change | `offline`, off |
| 4. Turn on | The game reopens with no connection | `offline`, on |

**Why one flag and one release, not one per story.** Each story merges and deploys on its own, but
a saved copy must not reach any phone until it can be updated and withdrawn. Once a copy is on a
phone, only those two stories can change it. So players get all three together.

The owner reviews the flags-on build on a real iPhone and a real Android phone before the flag is
turned on.

### Changes to earlier specs

| Earlier item | Change |
| --- | --- |
| spec-001 FR-016 (reopening needs a connection; the game keeps no copy of itself) | **Reversed** when the flag is turned on. The first half of FR-016 still holds: once loaded, the game works with no connection and playing makes no network requests. |
| spec-001 AC-21 (reloading with no connection does not load the game) | **Reversed** when the flag is turned on: replaced by AC-1 here. The locked scenario is changed only with the owner's approval, in the pull request that turns the flag on. Its behaviour survives as AC-5 and AC-12 here. |
| spec-001 Assumption "Offline opening comes from packaging" | **Replaced** by this spec. |
| spec-001 Edge case "Reloading or reopening with no connection does not load the game" | **Replaced** by this spec's edge cases. |
| spec-001 AC-18 (no network requests after the game opens) | **Still holds for playing**: saving the copy happens while the game opens, and playing never makes a request (FR-504). |
| spec-001 AC-17 (the public address serves the new version) | **Still holds**, and FR-507 and FR-508 carry it through to phones with a saved copy. |
| spec-004 Out of Scope "Reopening the game with no connection" | **Delivered here.** |

## Clarifications

### Session 2026-11-08

- Q: When a phone holds a copy and a new version is published, what does the player see the next
  time they open the game with a connection? → A: The latest version, every time there is a
  connection. The copy is used only with no connection, or when the connection does not answer
  within 3 seconds (FR-507, FR-508).
- Q: Should players be able to add the game to their home screen? → A: Not now. It stays a page in
  the browser until the store apps (F13).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Reopening with no connection (Priority: P1)

A player who has opened the game once, with a connection, can come back to it later with none. The
game opens as usual and can be played in full.

**Why this priority**: it is the whole point of the feature.

**Independent Test**: open the game once with a connection, turn the connection off, reload or
reopen the address, and play Solution A.

**Acceptance Scenarios**:

1. **AC-1** — **Given** the game has been opened once with a connection and the phone now has no
   connection, **When** the player reloads the page, **Then** the game shows "Hello, Operator!",
   "Fill the grid, pal." and "0 of 2".
2. **AC-2** — **Given** the same phone, still with no connection, **When** the player closes the
   page and opens the public address again, **Then** the game shows "Hello, Operator!".
3. **AC-3** — **Given** the game has been reopened with no connection, **When** the player enters
   Solution A (top-right 2, bottom-left 2, bottom-right 3, Row 2 ×, Column 1 ÷) and puts it through,
   **Then** the bubble says "You're connected! Keep 'em coming, pal!", the counter reads "1 of 2",
   and no network request is made while playing.
4. **AC-4** — **Given** the game has been reopened with no connection, **When** the player looks at
   the screen, **Then** the text is in the game's own typefaces, and the accessibility scan finds
   no problems.
5. **AC-5** — **Given** a phone that has never opened the game, with no connection, **When** the
   player opens the public address, **Then** the game does not load, as today.

---

### User Story 2 - Getting the new version (Priority: P1)

A player whose phone holds a saved copy still gets each new version, and is never interrupted by
one in the middle of a game.

**Why this priority**: without it, a saved copy could keep an old version on a phone indefinitely.
No copy may reach a player until this works.

**Independent Test**: save version A on a phone, publish version B, open the game with a
connection, and read which version is showing; then repeat with no connection.

**Acceptance Scenarios**:

6. **AC-6** — **Given** a phone holding version A and version B published, with a connection,
   **When** the player opens the game, **Then** version B is showing.
7. **AC-7** — **Given** the phone from AC-6, now with no connection, **When** the player reopens the
   game, **Then** version B is showing, with none of version A's files in use.
8. **AC-8** — **Given** a phone holding version A and version B published, with no connection,
   **When** the player opens the game, **Then** version A is showing and the player can enter and
   put through Solution A.
9. **AC-9** — **Given** a player part-way through a game on version A, with top-right 2 entered,
   **When** version B is published and the connection comes and goes, **Then** the game does not
   reload and top-right still shows 2.
10. **AC-10** — **Given** a phone holding version A and a connection that does not answer, **When**
    the player opens the game, **Then** after waiting 3 seconds for an answer the game falls back,
    and version A is ready to play within 4 seconds of opening.

---

### User Story 3 - Withdrawing a copy (Priority: P1)

If a version turns out to be bad, or offline play has to be turned off, the owner can put that right
for phones that already hold a copy.

**Why this priority**: every release must be reversible (Baseline principle 5). Rollback today is
a redeploy, and a saved copy must not undo that.

**Independent Test**: save a version on a phone, publish a rollback, and see which version shows;
then publish a build with offline turned off, and see that the copy has gone.

**Acceptance Scenarios**:

11. **AC-11** — **Given** a phone holding bad version B, and the earlier version A published again
    by rollback, **When** the player opens the game with a connection and then reopens it with
    none, **Then** version A is showing both times.
12. **AC-12** — **Given** a phone holding a copy, and a version published with offline turned off,
    **When** the player opens the game with a connection and then reloads with none, **Then** the
    game loads the first time and does not load the second, as spec-001 AC-21 describes.

---

### Edge Cases

- **Connection lost before the copy is saved**: the game goes on working as it does today. Reopening
  with no connection does not load it. The copy is saved on a later open with a connection.
- **A download fails part-way through**: the copy already on the phone stays whole and is used. The
  phone never holds a mixture of two versions (FR-506).
- **Reopening starts afresh**: as spec-001 says, the current entry and found solutions are not
  kept. Reopening with no connection starts at "0 of 2". The solution log (F5) adds saving.
- **The phone runs out of storage or clears the copy**: the game behaves as on a phone that has
  never opened it, and saves a copy on the next open with a connection.
- **A phone unused for a long time**: a browser may clear a site's saved copy by itself (see
  Assumptions). Reopening with no connection then does not load the game.
- **Private browsing**: the copy may not be kept. The game still works with a connection.
- **The connection returns while playing**: nothing changes on the screen.
- **The player is told nothing**: there is no message about saving, updating or being offline.
  Nothing is announced to a screen reader about any of them.

## Requirements *(mandatory)*

### Functional Requirements

**Keeping a copy**

- **FR-501**: The first time the game is opened with a connection, it MUST save a copy of itself on
  the phone, in the background, with no message and no effect on playing.
- **FR-502**: With the copy saved and no connection, reloading or opening the public address MUST
  show the game, fully playable.
- **FR-503**: The copy MUST include everything the game shows, including its typefaces.
- **FR-504**: Playing MUST make no network requests, with or without a connection. Network requests
  are made only while the game opens.
- **FR-505**: Only the public game is kept. The copy MUST contain nothing from any other site, and
  the development-only catalogue MUST NOT be part of it.

**Updating it**

- **FR-506**: A copy MUST always be one whole version. A new version replaces the old one only once
  all of it has arrived, and a player never sees a mixture.
- **FR-507**: With a connection, opening the game MUST show the latest published version and update
  the copy to it.
- **FR-508**: With a connection that does not answer within 3 seconds, opening the game MUST fall
  back to the copy.
- **FR-509**: A new version MUST NOT reload the game, or disturb what the player has entered, while
  it is open. It takes effect the next time the game is opened.

**Withdrawing it**

- **FR-510**: Rolling back to an earlier version MUST reach phones holding a copy by the same route
  as any new version (FR-507).
- **FR-511**: A version published with offline turned off MUST remove the copy from each phone the
  next time the game is opened with a connection, and the game MUST then behave as spec-001 AC-21
  describes.

**Flag**

- **FR-512**: While the `offline` flag is off, the game MUST keep no copy, and spec-001 AC-21 MUST
  still pass on the build players get.

### Key Entities

- **Saved copy**: one whole version of the game, held on one phone. It has a version (the build's
  existing version label). There is at most one in use at a time.

## Acceptance Criteria as Examples *(org baseline)*

AC-1 to AC-12 above use concrete examples. Solution A is spec-001's: top-right 2, bottom-left 2,
bottom-right 3, Row 2 ×, Column 1 ÷. Versions A and B are two published builds, told apart by the
version label the game already carries.

## Non-Functional Requirements *(mandatory — org baseline)*

- **Performance**: on the reference device, reopening with no connection is ready to play within 3
  seconds, and with a working connection stays within spec-001's 3-second budget (SC-004). With a
  connection that does not answer, it is ready within 4 seconds: the 3-second wait for an answer
  (FR-508), then the copy opening. Taps stay within 0.1 seconds (spec-001 SC-003). The game stays within its 30 KB budget for code
  and styles.
- **Availability**: none beyond GitHub Pages' own (EXC-002). This feature makes the game available
  to returning players when the address cannot be reached.
- **Security**: no accounts or personal data. The copy holds only the game's own public files,
  fetched from its own address over HTTPS. The plan records a threat model (Baseline principle 6),
  in particular what happens if a bad version is saved. FR-510 and FR-511 are the remedy.
- **Accessibility**: WCAG 2.2 AA as today. Nothing new is on screen or announced, and the reopened
  game passes the same accessibility scan (AC-4).
- **Capacity and scale**: one small copy per phone, well under 1 MB today (the game, its styles and
  typefaces).

## Integration and Contract Impact *(mandatory — org baseline)*

| Contract (API, event, file, schema) | New / Changed / Removed | Breaking? | Consumers affected |
|---|---|---|---|
| `docs/contracts/play-screen.md` | Unchanged | No | Nothing on screen changes |
| Files published to the public address | Changed: one more file or setting the browser uses to keep the copy | No | Phones that open the game |

No server or API is involved: the game has no backend. Constitution I says adding a network call
needs a spec and an ADR. This is the spec, and the plan adds the ADR. The only requests are for the
game's own files while it opens.

## Data Impact *(mandatory if the feature stores, moves or exposes data)*

- **Data items**: one copy of the game's public files on each phone. Nothing about the player is
  stored.
- **Classification**: public; no personal data.
- **System of record**: the public address. The copy on a phone is disposable.
- **Retention and deletion**: replaced by each new version. Removed by FR-511, when the player
  clears the browser's site data, or when the browser clears it.
- **Lawful basis / DPIA**: not required: no personal data. No cookie or consent notice is needed, as
  the copy is strictly necessary for the offline play the player gets from it, and tracks nothing.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-501**: After one open with a connection, the game reopens with no connection on an iPhone
  and an Android phone, and a whole puzzle can be solved, every time in testing.
- **SC-502**: With no connection, the game is ready to play within 3 seconds on the reference
  device.
- **SC-503**: Once a new version is published, a phone with a connection shows it on its next open,
  every time in testing.
- **SC-504**: A rollback or a turn-off reaches a phone on its next open with a connection, every
  time in testing.
- **SC-505**: Every acceptance criterion in specs 001 to 004 still passes, except spec-001 AC-21,
  which this spec replaces when the flag is turned on.
- **SC-506**: The owner signs off offline play on a real iPhone and a real Android phone in
  flight mode, before the flag is turned on.

## Assumptions

- **Browsers**: current and previous major versions of Safari on iOS and Chrome on Android (as
  spec-001).
- **Reference device**: spec-001's mid-range 2023 Android phone.
- **Copies can be cleared**: browsers may remove a site's saved data. In particular, Safari on iOS
  is understood to clear it after about seven days without a visit, for sites not added to the home
  screen. The plan confirms this. Offline reopening is therefore a best effort for players who
  have not visited recently. The owner accepted that limit on 2026-11-08, until the store apps
  (F13).
- **The store apps** (F13) carry the game inside the app and do not need this. How the two fit
  together is decided in F13.
- **Rollback**: stays as it is today: re-running the pipeline against an earlier commit, or
  reverting (ADR 0001).
- **No saved progress**: found solutions and the current entry are still lost on reload (F5).

## Out of Scope *(mandatory — org baseline)*

- Saving the player's progress or found solutions (F5).
- Any message or indicator about being offline, saving or updating.
- Store packaging (F13).
- Adding the game to the home screen, with its own name and icon (owner decision 2026-11-08).
- Offline support for the development-only catalogue.
- Background updates while the game is closed.
- Any change to the play screen, its wording or its look.
