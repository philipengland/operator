// Dialog (simple component): a pop-up over the screen (spec-006 research R10;
// docs/contracts/component-library.md).

export interface DialogProps {
  /** What a screen reader hears it called: the question it asks. */
  readonly name: string;
}

export interface DialogModel {
  readonly name: string;
  /** The classes that give it its look (dialog.css). */
  readonly classes: readonly string[];
}

export function dialogModel({ name }: DialogProps): DialogModel {
  return { name, classes: ['dialog'] };
}
