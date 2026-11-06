// The catalogue's samples: each component in every state the design guide lists (spec-003 FR-324).
// Fixed examples only; the catalogue does not play the puzzle (FR-327).

import { createButton } from '../ui/simple/button';
import { createText } from '../ui/simple/text';
import { createTextInput } from '../ui/simple/text-input';

export interface Sample {
  readonly label: string;
  render(): HTMLElement;
}

export const SAMPLES: Readonly<Record<string, readonly Sample[]>> = {
  Text: [
    { label: 'Display', render: () => createText({ text: 'Hello, Operator!', style: 'display' }).element },
    { label: 'Body', render: () => createText({ text: 'Tap a dashed bubble to swap its operator.', style: 'body' }).element },
  ],
  Button: [
    { label: 'Main', render: () => createButton({ label: 'Put it through!', style: 'main', action: 'Check' }).element },
    { label: 'Key', render: () => createButton({ label: '5', style: 'key' }).element },
    { label: 'Solid', render: () => createButton({ label: 'Oops', style: 'solid', action: 'clear cell' }).element },
    { label: 'Dashed', render: () => createButton({ label: '? 12', style: 'dashed' }).element },
    { label: 'Unavailable', render: () => createButton({ label: 'Check', style: 'key', isUnavailable: true }).element },
  ],
  'Text input': [{ label: 'Seed', render: () => createTextInput({ label: 'Play from a seed', hint: 'e.g. 4F7A21' }).element }],
};
