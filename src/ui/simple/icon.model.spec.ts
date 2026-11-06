import { describe, expect, it } from 'vitest';
import { iconModel } from './icon.model';

describe('iconModel', () => {
  it('is heard as what it means when it carries meaning', () => {
    const model = iconModel({ icon: 'tick', spokenAs: 'target reached' });

    expect(model).toMatchObject({ isHeard: true, name: 'target reached' });
  });

  it('is hidden from screen readers when it is decoration', () => {
    const model = iconModel({ icon: 'tick' });

    expect(model).toMatchObject({ isHeard: false, name: null });
  });

  it.each(['tick', 'cross'] as const)('carries the %s shape it is drawn as', (icon) => {
    expect(iconModel({ icon }).classes).toEqual(['icon', `icon--${icon}`]);
  });

  it.each([
    ['tick', '✓'],
    ['cross', '✗'],
  ] as const)('carries the %s as the character %s, its text in place of the drawing', (icon, glyph) => {
    expect(iconModel({ icon }).glyph).toBe(glyph);
  });
});
