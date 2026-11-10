// Play screen (screen): what its parts are told, worked out from the screen's props
// (docs/contracts/component-library.md).

import type { SpeechBubbleProps } from '../combined/speech-bubble';

/** The bubble's props for the screen: while an announcement holds a result, its line is not read twice. */
export function headerWithAnnouncement(header: SpeechBubbleProps, announcement: string): SpeechBubbleProps {
  return { ...header, isMessageHeard: announcement === '' };
}

/** spec-007 FR-719: the compact screen is for grids bigger than 3 × 3; the Today button needs daily puzzles. */
export interface PlayScreenLayout {
  readonly isCompact: boolean;
  readonly hasToday: boolean;
}

/** Which parts the screen shows. The Status bar is the counter with the Today button beside it. */
export interface PlayScreenParts {
  readonly header: boolean;
  readonly counterAlone: boolean;
  readonly statusBar: boolean;
  readonly strip: boolean;
}

export function playScreenParts({ isCompact, hasToday }: PlayScreenLayout): PlayScreenParts {
  if (isCompact) {
    return { header: false, counterAlone: false, statusBar: true, strip: true };
  }
  return { header: true, counterAlone: !hasToday, statusBar: hasToday, strip: false };
}
