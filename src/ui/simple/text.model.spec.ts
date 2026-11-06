import { describe, expect, it } from 'vitest';
import { textModel } from './text.model';

describe('textModel', () => {
  it.each(['display', 'body'] as const)('carries the %s style, which sets its typeface', (style) => {
    expect(textModel({ text: 'Hello, Operator!', style }).classes).toEqual(['text', `text--${style}`]);
  });
});
