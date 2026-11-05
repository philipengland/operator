// Which commit a build is made from, written into <meta name="version"> so the post-deploy
// check can compare it with the commit it expects (AC-17).

export const UNKNOWN_VERSION = 'unknown';

/**
 * The checked-out git commit: it is always the one built, including on a rollback run, where
 * GitHub's GITHUB_SHA still names the newest commit. GITHUB_SHA is the fallback without git.
 */
export function buildVersion(environment: Readonly<Record<string, string | undefined>>, readGitCommit: () => string): string {
  try {
    return readGitCommit();
  } catch {
    return environment.GITHUB_SHA ?? UNKNOWN_VERSION;
  }
}
