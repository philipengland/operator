// The only code that touches the browser's localStorage. Any refusal is caught, so the game carries on
// (spec-006 FR-612; research R4).

import type { SolutionStore } from './solution-store';

type BrowserStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

/** `storage` is a function because merely reaching localStorage can throw in some private modes. */
export function createBrowserStore(storage: () => BrowserStorage): SolutionStore {
  return { read: (key) => storage().getItem(key), write: () => undefined };
}
