import { describe, expect, it } from 'vitest';
import { surfaceModel } from './surface.model';

describe('surfaceModel', () => {
  it.each(['panel', 'bubble'] as const)('carries the %s variant, which sets its shadow and corners', (variant) => {
    expect(surfaceModel({ variant }).classes).toEqual(['surface', `surface--${variant}`]);
  });
});
