import { describe, expect, it } from 'vitest';
import { iconModel } from './icon.model';

describe('iconModel', () => {
  it('is heard as what it means when it carries meaning', () => {
    const model = iconModel({ icon: 'tick', spokenAs: 'target reached' });

    expect(model).toMatchObject({ isHeard: true, name: 'target reached' });
  });
});
