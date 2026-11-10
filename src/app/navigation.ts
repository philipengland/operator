// The screen showing, as a browser history entry, so the phone's own back gesture works (spec-006 research R7).

import type { Place } from './session';

export interface HistoryEntry {
  readonly place: Place;
}

export function historyEntryFor(place: Place): HistoryEntry {
  return { place };
}

/** Whatever the browser hands back; anything else there is treated as the puzzle. */
export function placeFrom(entry: unknown): Place {
  const place = (entry as Partial<HistoryEntry> | null | undefined)?.place;
  if (place?.kind === 'solution' && Number.isInteger(place.number) && place.number >= 1) {
    return place;
  }
  if (place?.kind === 'today') {
    return { kind: 'today' };
  }
  return place?.kind === 'list' ? { kind: 'list' } : { kind: 'play' };
}
