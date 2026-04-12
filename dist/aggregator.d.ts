/**
 * Manifest Aggregator (Index Model)
 *
 * @intent Build a master index of healthy source manifests
 * @guarantee Only includes sources that pass Bouncer validation
 */
import { type MasterIndex } from './types.js';
export interface BouncerResult {
    index: MasterIndex;
    droppedSources: Array<{
        name: string;
        error: string;
    }>;
}
export declare class ManifestAggregator {
    /**
     * Stitch valid source manifests into a master index
     */
    stitch(manifests: Array<{
        name: string;
        manifest: any;
        url: string;
        repo: string;
    }>): BouncerResult;
}
