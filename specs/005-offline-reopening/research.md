# Research: Reopening the Game with No Connection (spec-005)

**Date**: 2026-11-08. Each section gives the decision, why, and what else was considered.

## R1. How the copy is kept

**Decision**: a service worker, written by hand in TypeScript, using the browser's Cache Storage.
No new dependency.

**Why**: it is the only web standard that can answer a page load with no connection, on both
Safari for iOS and Chrome for Android. The logic is small (R2 to R5), and the rules forbid adding a
dependency unasked.

**Alternatives**:
- **Workbox or `vite-plugin-pwa`**: well proven, but a dependency, and more than this needs.
- **The old Application Cache**: removed from browsers.

## R2. What happens when the game is opened (FR-507, FR-508)

**Decision**: for the page itself, ask the network first, with a limit of 3 seconds; if there is no
answer, or no connection, use the copy.

- The request is made with `cache: 'no-cache'`. GitHub Pages sends `Cache-Control: max-age=600`
  (measured on the live site, 2026-11-08) and offers no way to change it, so a plain request could
  be answered with a page up to 10 minutes old.
- Files other than the page have the content's hash in their names, so they never change. They are
  taken from the copy when it has them, and from the network when it does not. A new page's files
  are not in the old copy, so they come from the network.
- With no connection the request fails at once, so the copy opens with no 3-second wait.

**Alternatives**: copy first with a background update (the owner's Question 1, option B, not
chosen).

## R3. One whole version (FR-506)

**Decision**: one store per version, named from the build's version label. A new service worker
fills its store with `addAll` during install. `addAll` is all-or-nothing, and a failed install
leaves the old worker and its store untouched. The file list is written into the worker at build
time from the build's own output.

**Why this also triggers updates**: the worker's text contains the version, so every build differs
from the last by at least that, and the browser installs it. Chrome since version 68 fetches the
worker script past the HTTP cache by default ([Chrome's note](https://developer.chrome.com/blog/fresher-sw)),
so `max-age=600` does not delay it. This is confirmed for Safari by test (R10).

## R4. Updating without disturbing a game (FR-509)

**Decision**: the new worker takes over as soon as it is installed (`skipWaiting`, `clients.claim`)
and deletes older stores. The page does not listen for the change and never reloads itself.

**Why it is safe**: an open game already holds its code, styles and typefaces, and makes no requests
while playing (FR-504).

**Alternative**: waiting until every tab closes. It keeps a stale worker for longer, and it would
delay AC-7.

## R5. Withdrawing a copy, and why the flag stays (FR-510, FR-511)

**Decision**:
- A rollback is an ordinary newer build as far as a phone is concerned: its worker text differs from
  the one installed, so it installs like any update (FR-510).
- A build with `offline` off contains no worker. On opening, its page removes this game's
  registration and its stores (FR-511). With a working connection the page always comes from the
  network (R2), so that code does reach the phone.
- **The `offline` flag stays after release**, as the control that turns offline play off. Removing
  it would remove the way to withdraw a copy. Recorded in the plan's Complexity Tracking, for the
  owner to confirm.

**A limit on rollback**: rolling back to a commit from before the flag was first turned on publishes
a build with no worker and, if it predates User Story 3, no code to remove one. Browsers keep an
existing worker when its script is missing. Online players still get that old version (R2), but
their copy stays on the phone for offline use. So once released: **to remove offline play, publish
with the flag off; do not roll back past the release commit**. Recorded in the ADR.

## R6. The address is shared

**Decision**: the service worker's scope is the game's own folder, and every name and deletion is
limited to this game: stores are prefixed `operator-`, and withdrawal only touches the registration
for the game's own scope.

**Why**: Cache Storage belongs to the whole origin, `philipengland.github.io`, which other projects
published from the same account would share. A careless "delete every store" would reach them.

## R7. Building the worker

**Decision**: a second entry in the Vite build, only when `offline` is on, emitted with the fixed name
`sw.js` beside `index.html`. A small build plugin fills in the file list and version. It is counted
in the 30 KB budget.

- `src/offline/` has its own `tsconfig.json` with the WebWorker library, as `src/engine/` has its own.
- The catalogue's build is separate and is never in the list (FR-505).

## R8. The content security policy

**Decision**: no change. `connect-src 'none'` stays on the page. `default-src 'self'` allows a worker
from the game's own address. The page's meta policy does not apply inside the worker, which fetches
only the game's own files.

## R9. Safari's clearing of saved data

**Finding**: WebKit announced in 2020 that script-writable storage, including service worker
registrations, is deleted after seven days of Safari use without interaction with the site. Web apps
added to the home screen have their own counter
([summary with WebKit's text](https://searchengineland.com/what-safaris-7-day-cap-on-script-writeable-storage-means-for-pwa-developers-332519)).
It counts days of Safari use, not calendar days. No current WebKit source was found confirming it
is unchanged, so the spec's wording ("understood to") stands. The owner accepted the limit on
2026-11-08.

## R10. Can this be tested?

**Finding, by experiment (2026-11-08)**: a small page with a service worker, driven by this project's
Playwright 1.64.1. After `setOffline`, both WebKit (iPhone SE) and Chromium (Pixel 5) reloaded the page
and opened it in a new tab from the worker, with no requests reaching the server. So every criterion
can run on both phones.

**Decision: a published-site stand-in in the test support code**, because the scenarios need "version
B is published" and "the connection does not answer".
- A small Node server, in Layer 3, on its own port. Each scenario gets its own path, so scenarios
  running in parallel cannot affect each other; the build's relative paths (`base: './'`) work under
  any path.
- It serves the flags-on build and replaces the version label in `index.html` and `sw.js` with "A",
  "B" and so on, so "publishing" a version needs no rebuild. It can hold requests without answering
  (AC-10).
- A third build, `build:flags-off` (mode `flags-off`), is what a turn-off release would publish (AC-12).
  It is the real control, not a test switch.
- The time limits are checked with the speed budgets on Android, alone (AGENTS.md).

## R11. "No network requests" (FR-504, spec-001 AC-18)

**Decision**: the worker registers after the page's `load` event, so opening is not slowed. Saving the
copy takes place then, as part of opening. Playing makes no requests, and spec-001's scenario stays
as it is. The worker's own downloads are made by the browser, not the page.

## R12. Releasing it, and spec-001 AC-21

**Decision**: one flag, `offline`, off for three pull requests (spec, Release order). The pull request
that turns it on also changes spec-001's locked AC-21, with the owner's approval. Until then AC-21
passes on what players get, as FR-512 requires. The `offline` scenarios run on the flags-on phones in
the meantime, by the existing rule in `playwright.config.ts`.
