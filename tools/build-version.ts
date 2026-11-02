// Which commit a build is made from, written into <meta name="version"> so the post-deploy
// check can compare it with the merged commit (AC-17).

export const UNKNOWN_VERSION = 'unknown';

/** GitHub Actions names the commit it builds; elsewhere, the checked-out git commit. */
export function buildVersion(environment: Readonly<Record<string, string | undefined>>, readGitCommit: () => string): string {
  if (environment.GITHUB_SHA) {
    return environment.GITHUB_SHA;
  }
  try {
    return readGitCommit();
  } catch {
    return UNKNOWN_VERSION;
  }
}
