// Speech bubble (combined component): the mascot's voice, a title line in display Text and one line
// of feedback in body Text, on a bubble Surface (docs/contracts/component-library.md). Read as text.

import './speech-bubble.css';
import { setAttributeOrRemove, type Component } from '../component';
import { createSurface } from '../simple/surface';
import { createText } from '../simple/text';

/** The simple components this one is laid out from (spec-003 AC-7). */
export const builtFrom: readonly string[] = ['Surface', 'Text'];

export interface SpeechBubbleProps {
  readonly title: string;
  readonly message: string;
  /** False while another part of the screen reads this line out, so it is not heard twice. */
  readonly isMessageHeard?: boolean;
  /** True when the title heads the whole screen (spec-006). */
  readonly isTitleHeading?: boolean;
}

export function createSpeechBubble(props: SpeechBubbleProps): Component<SpeechBubbleProps> {
  const title = createText({ text: props.title, style: 'display' });
  const message = createText({ text: props.message, style: 'body' });
  const bubble = createSurface({ variant: 'bubble' }, [headed(title.element, props.isTitleHeading === true), message.element]);
  bubble.element.classList.add('speech-bubble');
  const update = (next: SpeechBubbleProps): void => {
    title.update({ text: next.title, style: 'display' });
    message.update({ text: next.message, style: 'body' });
    setAttributeOrRemove(message.element, 'aria-hidden', next.isMessageHeard === false ? 'true' : null);
    message.element.hidden = next.message === '';
  };
  update(props);
  return { element: bubble.element, update };
}

/** The title as it is, or inside the screen's main heading. */
function headed(title: HTMLElement, isHeading: boolean): HTMLElement {
  if (!isHeading) {
    return title;
  }
  const heading = document.createElement('h1');
  heading.className = 'speech-bubble__heading';
  // Focus moves here when a screen opens (spec-006 research R11); it is not something to tab to.
  heading.tabIndex = -1;
  heading.append(title);
  return heading;
}
