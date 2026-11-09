// The screen showing, as a browser history entry, so the phone's own back gesture works (spec-006 research R7).

import type { Place } from './session';

export interface HistoryEntry {
  readonly place: Place;
}

export function historyEntryFor(place: Place): HistoryEntry {
  return { place };
}

/** Whatever the browser hands back; anything else there is treated as the puzzle. */
export function placeFrom(_entry: unknown): Place {
  return { kind: 'list' };
}
