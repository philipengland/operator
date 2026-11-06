// Text input (simple component): a field with a visible label that screen readers hear, and a hint
// (contract docs/contracts/component-library.md).

export interface TextInputProps {
  readonly label: string;
  readonly hint: string;
}

export interface TextInputModel {
  readonly label: string;
  readonly hint: string;
  /** The field's id, which its visible <label for> points at. */
  readonly fieldId: string;
}

export function textInputModel({ label, hint }: TextInputProps): TextInputModel {
  const slug = label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return { label, hint, fieldId: `field-${slug}` };
}
