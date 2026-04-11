/**
 * Manifest Fetcher
 *
 * @intent Fetch manifest.json from metadat source repositories
 * @guarantee Returns parsed manifest objects from each source's latest release
 */
import type { SourceManifest } from './types.js';
/**
 * Fetch manifests from metadat repositories
 */
export declare class ManifestFetcher {
    private octokit;
    private owner;
    /**
     * @param token GitHub token for API authentication
     */
    constructor(token: string);
    /**
     * Fetch latest manifests from specified sources
     * @param sources Array of source names (e.g., ['nointro', 'tosec'])
     * @returns Array of parsed manifest objects
     */
    fetchLatestManifests(sources: string[]): Promise<SourceManifest[]>;
    /**
     * Fetch content from a URL
     */
    private fetchContent;
}
