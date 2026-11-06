// The shape every component in the library shares (docs/contracts/component-library.md).

/** Writes text only when it changes (AGENTS.md: rewriting identical text re-announces it). */
export function writeText(target: Pick<Node, 'textContent'>, text: string): void {
  if (target.textContent !== text) {
    target.textContent = text;
  }
}

/** Sets an attribute, or removes it when there is no value. */
export function setAttributeOrRemove(element: Element, name: string, value: string | null): void {
  if (value === null) {
    element.removeAttribute(name);
  } else {
    element.setAttribute(name, value);
  }
}

/** A rendered component: its element, and a way to show new props in place. */
export interface Component<Props> {
  readonly element: HTMLElement;
  update(props: Props): void;
}
