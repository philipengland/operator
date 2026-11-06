// Button (simple component; contract docs/contracts/component-library.md): what a button shows and
// what a screen reader hears from it.

export type ButtonStyle = 'main' | 'key' | 'solid' | 'dashed';

export interface ButtonProps {
  readonly label: string;
  readonly style: ButtonStyle;
  /** What the button does, when its label alone does not say: "clear cell", "Check". */
  readonly action?: string;
  /** Shown but cannot be used: heard as unavailable, ignores taps, still focusable. */
  readonly isUnavailable?: boolean;
}

export interface ButtonModel {
  readonly label: string;
  readonly name: string;
  readonly isUnavailable: boolean;
}

export function buttonModel({ label, action, isUnavailable = false }: ButtonProps): ButtonModel {
  return { label, name: action ? `${label}, ${action}` : label, isUnavailable };
}
