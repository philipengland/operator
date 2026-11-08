import { describe, expect, it } from 'vitest';
import { featuresForBuild } from './features';

describe('featuresForBuild', () => {
  const released = { story: false };

  it('gives the flags-on build every feature, released or not', () => {
    expect(featuresForBuild('flags-on', released)).toEqual({ story: true });
  });

  it('gives every other build only what has been released: what players get', () => {
    expect(featuresForBuild('production', released)).toEqual(released);
  });
});
