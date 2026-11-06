// The catalogue's samples: each component in every state the design guide lists (spec-003 FR-324).
// Fixed examples only; the catalogue does not play the puzzle (FR-327).

import { createButton } from '../ui/simple/button';

export interface Sample {
  readonly label: string;
  render(): HTMLElement;
}

export const SAMPLES: Readonly<Record<string, readonly Sample[]>> = {
  Button: [
    { label: 'Main', render: () => createButton({ label: 'Put it through!', style: 'main', action: 'Check' }).element },
    { label: 'Key', render: () => createButton({ label: '5', style: 'key' }).element },
    { label: 'Solid', render: () => createButton({ label: 'Oops', style: 'solid', action: 'clear cell' }).element },
    { label: 'Dashed', render: () => createButton({ label: '? 12', style: 'dashed' }).element },
    { label: 'Unavailable', render: () => createButton({ label: 'Check', style: 'key', isUnavailable: true }).element },
  ],
};
