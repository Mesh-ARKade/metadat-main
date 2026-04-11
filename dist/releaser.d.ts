/**
 * Master Releaser
 *
 * @intent Publish master manifest to GitHub release
 * @guarantee Overwrites existing "latest" release
 */
export declare class MasterReleaser {
    private octokit;
    private owner;
    private repo;
    constructor(token: string);
    /**
     * Publish master manifest to "latest" release
     * @param manifestContent JSON string of master manifest
     * @returns Release URL
     */
    publishLatest(manifestContent: string): Promise<string>;
}
