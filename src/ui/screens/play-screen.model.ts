// Play screen (screen): what its parts are told, worked out from the screen's props
// (docs/contracts/component-library.md).

import type { SpeechBubbleProps } from '../combined/speech-bubble';

/** The bubble's props for the screen: while an announcement holds a result, its line is not read twice. */
export function headerWithAnnouncement(header: SpeechBubbleProps, announcement: string): SpeechBubbleProps {
  return { ...header, isMessageHeard: announcement === '' };
}
