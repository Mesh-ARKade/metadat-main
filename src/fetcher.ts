/**
 * Manifest Fetcher
 *
 * @intent Fetch manifest.json from metadat source repositories
 * @guarantee Returns parsed manifest objects from each source's latest release
 */

import { Octokit } from '@octokit/rest';
import type { SourceManifest } from './types.js';

/**
 * Fetch manifests from metadat repositories
 */
export class ManifestFetcher {
  private octokit: Octokit;
  private owner = 'Mesh-ARKade';

  /**
   * @param token GitHub token for API authentication
   */
  constructor(token: string) {
    this.octokit = new Octokit({ auth: token });
  }

  /**
   * Fetch latest manifests from specified sources
   * @param sources Array of source names (e.g., ['nointro', 'tosec'])
   * @returns Array of parsed manifest objects
   */
  async fetchLatestManifests(sources: string[]): Promise<SourceManifest[]> {
    const manifests: SourceManifest[] = [];

    for (const source of sources) {
      try {
        const repo = `metadat-${source}`;
        
        // Get latest release
        const releaseResponse = await this.octokit.repos.getLatestRelease({
          owner: this.owner,
          repo
        });

        // Find manifest.json asset
        const assets = releaseResponse.data.assets;
        const manifestAsset = assets.find(a => a.name === 'manifest.json');
        
        if (!manifestAsset) {
          console.warn(`[fetcher] No manifest.json found for ${source}`);
          continue;
        }

        // Download manifest content
        const assetResponse = await this.octokit.repos.getReleaseAsset({
          owner: this.owner,
          repo,
          asset_id: manifestAsset.id
        });

        // Parse JSON (browser download URL needs to be fetched differently)
        // For GitHub API, we need to use the browser_download_url
        const downloadUrl = manifestAsset.browser_download_url;
        const manifestContent = await this.fetchContent(downloadUrl);
        
        const parsed = JSON.parse(manifestContent) as SourceManifest;
        manifests.push(parsed);
        
        console.log(`[fetcher] Fetched manifest from ${source}`);
      } catch (error) {
        console.error(`[fetcher] Failed to fetch ${source}:`, error);
      }
    }

    return manifests;
  }

  /**
   * Fetch content from a URL
   */
  private async fetchContent(url: string): Promise<string> {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${url}: ${response.status}`);
    }
    return response.text();
  }
}