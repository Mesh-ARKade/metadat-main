/**
 * Manifest Aggregator
 *
 * @intent Stitch multiple source manifests into a unified master manifest
 * @guarantee Produces MasterManifest with aggregated totals, drops invalid sources
 */
import type { SourceManifest, MasterManifest } from './types.js';
export interface BouncerResult {
    master: MasterManifest;
    droppedSources: Array<{
        name: string;
        error: string;
    }>;
}
export declare class ManifestAggregator {
    /**
     * Combine multiple source manifests into a master manifest with Bouncer validation
     * @param manifests Array of source manifests to stitch
     * @returns BouncerResult with master manifest and any dropped sources
     */
    stitch(manifests: SourceManifest[]): BouncerResult;
}
