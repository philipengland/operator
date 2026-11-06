// Text (simple component): words in the display typeface (titles, digits, targets) or the body
// typeface (helper text, labels) (contract docs/contracts/component-library.md).

export type TextStyle = 'display' | 'body';

export interface TextProps {
  readonly text: string;
  readonly style: TextStyle;
}

export interface TextModel {
  readonly text: string;
  /** The classes that give the text its typeface (text.css). */
  readonly classes: readonly string[];
}

export function textModel({ text, style }: TextProps): TextModel {
  return { text, classes: ['text', `text--${style}`] };
}
