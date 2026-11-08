# Data Model: Reopening the Game with No Connection (spec-005)

No server data and nothing about the player. The one new item is on the phone.

## Saved copy

| Field | Meaning | Rule |
| --- | --- | --- |
| Version | The build's version label, also in `<meta name="version">` | One copy per version |
| Store name | `operator-<version>` | Prefix limits every deletion to this game (research R6) |
| Files | The page, script, styles and typefaces, from the build's own output | All or none (FR-506). Never the catalogue (FR-505) or another site's files |

**Classification**: public. **System of record**: the public address; the copy is disposable.

## States, for one phone

```text
no copy ──(open with a connection, flag on; all files arrive)──▶ holds version A

holds A ──(open with a connection, B published; all of B arrives)──▶ holds B, A deleted
holds A ──(as above, but a download fails)────────────────────────▶ holds A, unchanged
holds A ──(open with no connection, or no answer within 3 seconds)─▶ holds A; A is shown
holds A ──(open with a connection, flag off)──────────────────────▶ no copy
holds A ──(browser or player clears site data)────────────────────▶ no copy
```

## What opening the game shows

| Copy on phone | Connection | Shown |
| --- | --- | --- |
| none | working | latest version; the copy is saved |
| none | none | the browser's own "no connection" page (AC-5) |
| version A | working | the latest version (AC-6); the copy follows it |
| version A | none | A, at once (AC-1, AC-8) |
| version A | does not answer in 3 seconds | A (AC-10) |

The player's entry and found solutions are not part of the copy (spec-001 "No saving").
