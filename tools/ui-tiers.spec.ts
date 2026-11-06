import { describe, expect, it } from 'vitest';
import { stylingDeclarationsIn } from './ui-tiers.ts';

describe('combined components and screens add no styling (spec-003 AC-7)', () => {
  describe('stylingDeclarationsIn', () => {
    it('finds a colour declared in a stylesheet', () => {
      expect(stylingDeclarationsIn('.counter { display: flex; color: red; }')).toEqual(['color: red']);
    });

    it.each([
      'background: var(--accent)',
      'background-color: #fff',
      'border: 4px solid var(--ink)',
      'border-color: var(--ink)',
      'border-radius: 30px',
      'box-shadow: 6px 6px 0 var(--ink)',
      'font-family: var(--font-display)',
      'font-size: 2rem',
      'font-weight: 800',
      'outline: 4px dashed var(--accent)',
    ])('finds "%s"', (declaration) => {
      expect(stylingDeclarationsIn(`.part { ${declaration}; }`)).toEqual([declaration]);
    });

    it('allows layout, and "border: none"', () => {
      const layout = '.grid { display: grid; grid-template-columns: 64px repeat(2, 1fr); gap: 8px; padding: 14px; border: none; }';
      expect(stylingDeclarationsIn(layout)).toEqual([]);
    });
  });
});
