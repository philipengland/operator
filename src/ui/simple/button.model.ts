// Button (simple component; contract docs/contracts/component-library.md): what a button shows and
// what a screen reader hears from it.

/** cell and cell-correct: a puzzle grid cell, and one in a line that reaches its target. */
export type ButtonStyle = 'main' | 'key' | 'solid' | 'dashed' | 'cell' | 'cell-correct';

export interface ButtonProps {
  readonly label: string;
  readonly style: ButtonStyle;
  /** What the button does, when its label alone does not say: "clear cell", "Check". */
  readonly action?: string;
  /**
   * Its whole name, where "label, action" would not read well: "Top-right cell, 8" for a cell
   * showing "8". It must contain the label (WCAG 2.5.3, label in name).
   */
  readonly name?: string;
  /** Shown but cannot be used: heard as unavailable, ignores taps, still focusable. */
  readonly isUnavailable?: boolean;
  /** One of a set the player picks from (the selected cell): heard as selected (pressed). */
  readonly isSelected?: boolean;
}

export interface ButtonModel {
  readonly label: string;
  readonly name: string;
  readonly isUnavailable: boolean;
  readonly isSelected: boolean;
  /** The classes that give the button its style (button.css). */
  readonly classes: readonly string[];
}

export function buttonModel({ label, style, action, name, isUnavailable = false, isSelected = false }: ButtonProps): ButtonModel {
  return { label, name: name ?? (action ? `${label}, ${action}` : label), isUnavailable, isSelected, classes: ['button', `button--${style}`] };
}
