/**
 * Manifest Fetcher (Index Model)
 *
 * @intent Locate manifest.json URLs from metadat source repositories
 * @guarantee Returns metadata and URLs for each source's latest release
 */
export interface SourceReleaseInfo {
    name: string;
    repo: string;
    manifestUrl: string;
    updatedAt: string;
}
/**
 * Fetch manifest locations from metadat repositories
 */
export declare class ManifestFetcher {
    private octokit;
    private owner;
    constructor(token: string);
    /**
     * Locate latest manifests from specified sources
     */
    locateLatestManifests(sources: string[]): Promise<SourceReleaseInfo[]>;
}
