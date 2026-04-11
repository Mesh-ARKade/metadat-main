/**
 * Master Releaser
 *
 * @intent Publish master manifest to GitHub release
 * @guarantee Overwrites existing "latest" release
 */

import { Octokit } from '@octokit/rest';

export class MasterReleaser {
  private octokit: Octokit;
  private owner = 'Mesh-ARKade';
  private repo = 'metadat-main';

  constructor(token: string) {
    this.octokit = new Octokit({ auth: token });
  }

  /**
   * Publish master manifest to "latest" release
   * @param manifestContent JSON string of master manifest
   * @returns Release URL
   */
  async publishLatest(manifestContent: string): Promise<string> {
    const tagName = 'latest';
    
    // Check for existing release
    try {
      const existing = await this.octokit.repos.getLatestRelease({
        owner: this.owner,
        repo: this.repo
      });
      
      // Delete existing release and its assets
      await this.octokit.repos.deleteRelease({
        owner: this.owner,
        repo: this.repo,
        release_id: existing.data.id
      });
      
      console.log('[releaser] Deleted existing release');
    } catch (error: any) {
      // No existing release - that's fine
      if (error.status !== 404) {
        console.error('[releaser] Error checking existing release:', error);
      }
    }

    // Create new release
    const release = await this.octokit.repos.createRelease({
      owner: this.owner,
      repo: this.repo,
      tag_name: tagName,
      name: 'Master Manifest Latest',
      body: `Master manifest generated at ${new Date().toISOString()}`,
      draft: false,
      prerelease: false
    });

    // Upload manifest asset
    await this.octokit.repos.uploadReleaseAsset({
      owner: this.owner,
      repo: this.repo,
      release_id: release.data.id,
      name: 'master-manifest.json',
      data: manifestContent as any
    });

    console.log('[releaser] Published master manifest');
    return release.data.html_url;
  }
}