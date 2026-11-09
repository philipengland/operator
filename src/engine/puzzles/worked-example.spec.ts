import { describe, expect, it } from 'vitest';
import { workedExample } from './worked-example';

describe('workedExample', () => {
  it('has an identity for what is saved against it (spec-006 FR-613)', () => {
    expect(workedExample.id).toBe('worked-example');
  });
});
