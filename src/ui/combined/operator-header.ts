// Operator header (combined component): the Mascot beside a Speech bubble
// (docs/contracts/component-library.md). Only the bubble's words are read; the mascot is hidden.

import './operator-header.css';
import type { Component } from '../component';
import { createMascot } from '../simple/mascot';
import { createSpeechBubble, type SpeechBubbleProps } from './speech-bubble';

/** The components this one is laid out from (spec-003 AC-7). */
export const builtFrom: readonly string[] = ['Mascot', 'Speech bubble'];

export function createOperatorHeader(props: SpeechBubbleProps): Component<SpeechBubbleProps> {
  const bubble = createSpeechBubble(props);
  const element = document.createElement('div');
  element.className = 'operator-header';
  element.append(createMascot().element, bubble.element);
  return { element, update: bubble.update };
}
