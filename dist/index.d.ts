/**
 * metadat-main - Master Manifest Aggregator
 *
 * @intent Coordinate fetching, aggregating, and releasing master manifest
 * @guarantee Pulls from all metadat repos, stitches, and publishes to latest release
 */
/**
 * Run the aggregation pipeline
 */
export declare function runAggregator(): Promise<void>;
