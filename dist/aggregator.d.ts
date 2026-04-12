/**
 * Manifest Aggregator (Strict Index Model)
 *
 * @intent Build a master index of source manifest URLs
 * @guarantee Trust the source repositories for their own output validation
 */
import { type MasterIndex } from './types.js';
import { type SourceReleaseInfo } from './fetcher.js';
export declare class ManifestAggregator {
    /**
     * Stitch source release info into a master index
     */
    stitch(releases: SourceReleaseInfo[]): MasterIndex;
}
