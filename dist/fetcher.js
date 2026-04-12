/**
 * Manifest Fetcher (Index Model)
 *
 * @intent Locate manifest.json URLs from metadat source repositories
 * @guarantee Returns metadata and URLs for each source's latest release
 */
import { Octokit } from '@octokit/rest';
/**
 * Fetch manifest locations from metadat repositories
 */
export class ManifestFetcher {
    octokit;
    owner = 'Mesh-ARKade';
    constructor(token) {
        this.octokit = new Octokit({ auth: token });
    }
    /**
     * Locate latest manifests from specified sources
     */
    async locateLatestManifests(sources) {
        const results = [];
        for (const source of sources) {
            try {
                const repo = `metadat-${source}`;
                console.log(`[fetcher] Checking ${repo}...`);
                const releaseResponse = await this.octokit.repos.getLatestRelease({
                    owner: this.owner,
                    repo
                });
                const assets = releaseResponse.data.assets;
                const manifestAsset = assets.find(a => a.name === 'manifest.json');
                if (!manifestAsset) {
                    console.warn(`[fetcher] No manifest.json found for ${source}`);
                    continue;
                }
                results.push({
                    name: source,
                    repo: `Mesh-ARKade/${repo}`,
                    manifestUrl: manifestAsset.browser_download_url,
                    updatedAt: releaseResponse.data.published_at || new Date().toISOString()
                });
                console.log(`[fetcher] Located manifest for ${source}`);
            }
            catch (error) {
                console.error(`[fetcher] Failed to locate ${source}:`, error.message);
            }
        }
        return results;
    }
}
