import { describe, expect, it } from 'vitest';
import { buildVersion, UNKNOWN_VERSION } from './build-version';

const MERGED_COMMIT = 'a1b2c3d4e5f60718293a4b5c6d7e8f9012345678';
const CHECKED_OUT_COMMIT = '0f9e8d7c6b5a49382716f5e4d3c2b1a098765432';

describe('buildVersion', () => {
  // A rollback run checks out an older commit, but GitHub still names the newest one.
  it('uses the checked-out commit even when GitHub Actions names a different one', () => {
    const version = buildVersion({ GITHUB_SHA: MERGED_COMMIT }, () => CHECKED_OUT_COMMIT);

    expect(version).toBe(CHECKED_OUT_COMMIT);
  });

  it('uses the checked-out git commit outside GitHub Actions', () => {
    const version = buildVersion({}, () => CHECKED_OUT_COMMIT);

    expect(version).toBe(CHECKED_OUT_COMMIT);
  });

  it('uses the commit GitHub Actions names when git cannot be read', () => {
    const version = buildVersion({ GITHUB_SHA: MERGED_COMMIT }, () => {
      throw new Error('not a git repository');
    });

    expect(version).toBe(MERGED_COMMIT);
  });

  it('says the version is unknown when git cannot be read', () => {
    const version = buildVersion({}, () => {
      throw new Error('not a git repository');
    });

    expect(version).toBe(UNKNOWN_VERSION);
  });
});
