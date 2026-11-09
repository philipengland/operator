// The only code that touches the browser's localStorage. Any refusal is caught, so the game carries on
// (spec-006 FR-612; research R4).

import type { SolutionStore } from './solution-store';

type BrowserStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

/** `storage` is a function because merely reaching localStorage can throw in some private modes. */
export function createBrowserStore(storage: () => BrowserStorage): SolutionStore {
  return {
    read: (key) => attempt(() => storage().getItem(key), null),
    write: (key, value) =>
      attempt(() => {
        if (value === null) {
          storage().removeItem(key);
        } else {
          storage().setItem(key, value);
        }
      }, undefined),
  };
}

/** The browser's answer, or the fallback when it refuses. */
function attempt<Answer>(action: () => Answer, fallback: Answer): Answer {
  try {
    return action();
  } catch {
    return fallback;
  }
}
