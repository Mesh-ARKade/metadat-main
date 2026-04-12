/**
 * Manifest Aggregator (Strict Index Model)
 *
 * @intent Build a master index of source manifest URLs
 * @guarantee Trust the source repositories for their own output validation
 */
export class ManifestAggregator {
    /**
     * Stitch source release info into a master index
     */
    stitch(releases) {
        const index = {
            version: '1.2.0',
            generated: new Date().toISOString(),
            sources: releases.map(r => ({
                name: r.name,
                manifestUrl: r.manifestUrl,
                repo: r.repo,
                lastUpdated: r.updatedAt
            })),
            totalSources: releases.length
        };
        return index;
    }
}
