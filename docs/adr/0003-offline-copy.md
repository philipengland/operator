# 0003. A saved copy of the game, kept by a service worker

- **Status:** Not adopted. Parked with spec-005 by the owner on 2026-11-08: the store apps (F13) open with no connection without it. spec-001's decision stands.
- **Date:** 2026-11-08
- **Revisits:** spec-001 FR-016 and its assumption "Offline opening comes from packaging"

## Context

spec-001 decided the browser game would keep no copy of itself: a copy could go on serving an old
version after a merge, and the store apps (F13) would open offline anyway. While reviewing spec-004
the owner asked for real offline play in the browser. spec-005 sets the rules. Constitution I
requires an ADR for adding a network call.

## Decision

| Concern | Choice |
| --- | --- |
| Mechanism | A hand-written service worker and the browser's Cache Storage. No new dependency. |
| Opening | The page comes from the network first, bypassing the 10-minute HTTP cache GitHub Pages imposes, for at most 3 seconds; otherwise from the copy. |
| Whole versions | One store per version, filled all-or-nothing at install. Older stores are deleted on takeover. |
| A game in progress | Never reloaded or disturbed. A new version takes effect at the next open. |
| Withdrawal | A build with the `offline` flag off has no worker, and its page removes the copy. |
| The flag | `offline` stays after release, as the only way to withdraw a copy: an accepted departure from constitution VII's removal rule, recorded in the plan. |
| Scope | The game's folder only. Every name is prefixed, as the origin is shared with any other project pages on the account. |

## Consequences

**Easier**

- Players can reopen the game with no signal.
- A connected player still gets every new version, and so every fix, on their next open.

**Harder, or accepted risk**

- **Do not roll back past the commit that first turned the flag on.** That build has no worker, and
  browsers keep an existing worker when its script is missing, so phones would keep their copy for
  offline use. Publish with the flag off instead.
- A service worker is long-lived code on players' phones. A bad one can only be replaced by publishing
  a fix and waiting for each phone's next open.
- On a connection that does not answer, opening can take up to about 4 seconds.
- Safari on iOS is understood to clear a site's data after seven days of use without a visit, for sites
  not on the home screen. The owner accepted that until the store apps (F13).
- The acceptance suite gains a stand-in for the published site, to play out versions.

## Alternatives considered

- **Workbox or `vite-plugin-pwa`**: a dependency for logic of about a hundred lines.
- **Copy first, update in the background**: faster to open, but a bad version lasts one more open (owner
  decision, spec-005 Question 1).
- **Wait for the store apps**: the status quo, and the owner decided against waiting.
