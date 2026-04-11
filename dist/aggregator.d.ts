/**
 * Manifest Aggregator
 *
 * @intent Stitch multiple source manifests into a unified master manifest
 * @guarantee Produces MasterManifest with aggregated totals
 */
import type { SourceManifest, MasterManifest } from './types.js';
export declare class ManifestAggregator {
    /**
     * Combine multiple source manifests into a master manifest
     * @param manifests Array of source manifests to stitch
     * @returns Unified master manifest
     */
    stitch(manifests: SourceManifest[]): MasterManifest;
}
