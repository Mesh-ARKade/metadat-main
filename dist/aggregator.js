/**
 * Manifest Aggregator
 *
 * @intent Stitch multiple source manifests into a unified master manifest
 * @guarantee Produces MasterManifest with aggregated totals
 */
export class ManifestAggregator {
    /**
     * Combine multiple source manifests into a master manifest
     * @param manifests Array of source manifests to stitch
     * @returns Unified master manifest
     */
    stitch(manifests) {
        const allSources = [];
        let totalSystems = 0;
        let totalArtifacts = 0;
        let totalSize = 0;
        // Collect all sources from all manifests
        const allSystems = new Set();
        for (const manifest of manifests) {
            for (const source of manifest.sources) {
                // Add artifacts to totals
                for (const artifact of source.artifacts) {
                    totalArtifacts++;
                    totalSize += artifact.size;
                    // Track unique system IDs
                    for (const system of artifact.systems) {
                        allSystems.add(system.id);
                    }
                }
                allSources.push(source);
            }
        }
        totalSystems = allSystems.size;
        const master = {
            version: '1.0.0',
            generated: new Date().toISOString(),
            sources: allSources,
            totalSystems,
            totalArtifacts,
            totalSize
        };
        return master;
    }
}
