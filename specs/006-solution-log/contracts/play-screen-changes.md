# Contract changes: Play Screen (spec-006)

**Date**: 2026-11-08. Additions to `docs/contracts/play-screen.md`, the names the UI driver and screen
readers rely on. Each takes effect with its flag.

## The counter (`log`)

| Element | Role | Accessible name | Behaviour |
| --- | --- | --- | --- |
| Counter | `button` | "Found N of M" / "Found N" | Opens the list. The look is unchanged. Still not a live region |

## The list

| Element | Role | Accessible name | Behaviour |
| --- | --- | --- | --- |
| Heading | `heading` | "Solutions" | Receives focus on arrival |
| Way back | `button` | "Back" | Same as the phone's back gesture |
| Empty line | text | "No solutions found yet" | Visible: "No calls yet, pal.", with the theme's address |
| Row | `button` (`reopen`); text before that | "Solution 1" | Opens that solution |
| Start again | `button` (`startAgain`) | "Start again" | Not shown when nothing is found |

## The read-only view (`reopen`)

| Element | Role | Accessible name | Behaviour |
| --- | --- | --- | --- |
| Heading | `heading` | "Solution 1" | Receives focus on arrival |
| Way back | `button` | "Back" | To the list |
| Puzzle | `group` | "Puzzle" | No buttons inside it |
| Cell | text | "Top-right cell, 2" / "Top-left cell, given 6" | Not a button |
| Pill | text | "Row 2 target 6, times, target reached" | Not a button |
| Working | text, labelled | As on the play screen | |

## The pop-up (`startAgain`)

| Element | Role | Accessible name | Behaviour |
| --- | --- | --- | --- |
| Pop-up | `dialog`, modal | "Clear all solutions?" | Keeps focus inside. The phone's back closes it |
| Confirm | `button` | "Yes, clear" | Clears; not placed where "Start again" sits |
| Cancel | `button` | "Keep them" | Closes; focus returns to "Start again" |

The wording may be changed at the owner's review, before the scenarios are approved.
