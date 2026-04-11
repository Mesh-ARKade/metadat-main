/**
 * Manifest Fetcher
 *
 * @intent Fetch manifest.json from metadat source repositories
 * @guarantee Returns parsed manifest objects from each source's latest release
 */
import { Octokit } from '@octokit/rest';
/**
 * Fetch manifests from metadat repositories
 */
export class ManifestFetcher {
    octokit;
    owner = 'Mesh-ARKade';
    /**
     * @param token GitHub token for API authentication
     */
    constructor(token) {
        this.octokit = new Octokit({ auth: token });
    }
    /**
     * Fetch latest manifests from specified sources
     * @param sources Array of source names (e.g., ['nointro', 'tosec'])
     * @returns Array of parsed manifest objects
     */
    async fetchLatestManifests(sources) {
        const manifests = [];
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
                const parsed = JSON.parse(manifestContent);
                manifests.push(parsed);
                console.log(`[fetcher] Fetched manifest from ${source}`);
            }
            catch (error) {
                console.error(`[fetcher] Failed to fetch ${source}:`, error);
            }
        }
        return manifests;
    }
    /**
     * Fetch content from a URL
     */
    async fetchContent(url) {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch ${url}: ${response.status}`);
        }
        return response.text();
    }
}
