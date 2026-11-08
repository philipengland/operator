# Contract: The Offline Copy (spec-005)

**Date**: 2026-11-08. What a build publishes and how the page and worker behave. The play-screen
contract is unchanged: nothing on screen differs.

## What a build publishes

| Build | `sw.js` | Page, on opening |
| --- | --- | --- |
| `offline` on | Present, beside `index.html`. Contains the version and the build's file list | Registers `./sw.js` after `load` |
| `offline` off | Absent | Removes this game's registration and every `operator-*` store |

## Worker behaviour

| Event | Behaviour |
| --- | --- |
| Install | Stores every file in the list in `operator-<version>`, all or nothing, bypassing the HTTP cache |
| Takes over | Immediately after install. Deletes every other `operator-*` store. Never touches stores without that prefix |
| Page request | Network first, with `no-cache`, for at most 3 seconds; otherwise the stored page |
| Other request, same address | The stored file if there is one, otherwise the network |
| Request to another site | Not handled |

## Unchanged

- The page's content security policy, including `connect-src 'none'`.
- `<meta name="version">`, which the scenarios read to tell versions apart.
- The page never reloads itself.
