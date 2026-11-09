import { describe, expect, it } from 'vitest';
import { surfaceModel } from './surface.model';

describe('surfaceModel', () => {
  it.each(['panel', 'bubble'] as const)('carries the %s variant, which sets its shadow and corners', (variant) => {
    expect(surfaceModel({ variant }).classes).toEqual(['surface', `surface--${variant}`]);
  });

  it.each(['accent', 'ink'] as const)('can be filled with the %s, which also sets the colour of its words', (fill) => {
    expect(surfaceModel({ variant: 'panel', fill }).classes).toEqual(['surface', 'surface--panel', `surface--${fill}`]);
  });

  it('can be something to tap', () => {
    expect(surfaceModel({ variant: 'panel', isTappable: true }).classes).toEqual(['surface', 'surface--panel', 'surface--tappable']);
  });
});
