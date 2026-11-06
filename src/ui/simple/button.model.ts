// Button (simple component; contract docs/contracts/component-library.md): what a button shows and
// what a screen reader hears from it.

export type ButtonStyle = 'main' | 'key' | 'solid' | 'dashed';

export interface ButtonProps {
  readonly label: string;
  readonly style: ButtonStyle;
}

export interface ButtonModel {
  readonly label: string;
  readonly name: string;
}

export function buttonModel({ label }: ButtonProps): ButtonModel {
  return { label, name: label };
}
