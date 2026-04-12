/**
 * metadat-main - Master Manifest Aggregator (Index Model)
 *
 * @intent Coordinate fetching, validating, and indexing source manifests
 * @guarantee Only healthy manifests are included in the Master Index
 */
/**
 * Run the aggregation pipeline
 */
export declare function runAggregator(): Promise<void>;
