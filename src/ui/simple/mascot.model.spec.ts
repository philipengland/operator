import { describe, expect, it } from 'vitest';
import { mascotModel } from './mascot.model';

describe('mascotModel', () => {
  it('is drawn at 76 pixels in the theme colours only: ink head, paper face, accent mouth and headset', () => {
    const { sizeInPixels, shapes } = mascotModel();

    const paints = new Set(shapes.flatMap((shape) => [shape.fill, shape.stroke]).filter((paint) => paint !== undefined));
    expect(sizeInPixels).toBe(76);
    expect([...paints].sort()).toEqual(['accent', 'ink', 'paper']);
  });
});
