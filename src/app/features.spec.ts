import { describe, expect, it } from 'vitest';
import { featuresForBuild } from './features';

describe('featuresForBuild', () => {
  const released = { keypad: true, voice: false };

  it('gives the flags-on build every feature, released or not', () => {
    expect(featuresForBuild('flags-on', released)).toEqual({ keypad: true, voice: true });
  });

  it('gives every other build only what has been released: what players get', () => {
    expect(featuresForBuild('production', released)).toEqual(released);
  });
});
