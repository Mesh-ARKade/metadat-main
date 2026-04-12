/**
 * metadat-main - Master Manifest Aggregator (Index Model)
 *
 * @intent Coordinate fetching, validating, and indexing source manifests
 * @guarantee Only healthy manifests are included in the Master Index
 */
import { ManifestFetcher } from './fetcher.js';
import { ManifestAggregator } from './aggregator.js';
import { MasterReleaser } from './releaser.js';
import { DiscordNotifier } from './notifier.js';
// Configured sources to aggregate
const SOURCES = ['nointro', 'tosec', 'redump', 'mame'];
/**
 * Run the aggregation pipeline
 */
export async function runAggregator() {
    const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || '';
    const webhookUrl = process.env.DISCORD_WEBHOOK_URL || '';
    const dryRun = process.argv.includes('--dry-run');
    console.log('[aggregator] Starting master index aggregation...');
    console.log(`[aggregator] Sources: ${SOURCES.join(', ')}`);
    // Send started notification
    if (webhookUrl) {
        const notifier = new DiscordNotifier(webhookUrl);
        await notifier.notify({
            type: 'started',
            source: 'aggregator',
            timestamp: new Date().toISOString()
        }).catch(console.error);
    }
    try {
        // Step 1: Fetch manifests and their metadata
        console.log('[aggregator] Fetching manifests...');
        const fetcher = new ManifestFetcher(token);
        const manifests = await fetcher.fetchLatestManifests(SOURCES);
        console.log(`[aggregator] Fetched ${manifests.length} manifests`);
        // Step 2: Run Bouncer and build the Master Index
        console.log('[aggregator] Validating and Indexing...');
        const aggregator = new ManifestAggregator();
        const result = aggregator.stitch(manifests);
        const index = result.index;
        console.log(`[aggregator] Index built: ${index.totalSources} healthy sources identified`);
        // Check for dropped sources (Bouncer warnings)
        const warnings = result.droppedSources.map(ds => `Dropped ${ds.name}: ${ds.error}`);
        if (warnings.length > 0) {
            console.warn(`[aggregator] Bouncer dropped ${warnings.length} source(s):`, warnings);
        }
        if (index.totalSources === 0 && !dryRun) {
            throw new Error('No healthy manifests found - aborting master release to protect clients');
        }
        // Step 3: Publish the Master Index to GitHub
        if (dryRun) {
            console.log('[aggregator] Dry run - skipping release');
            console.log('[aggregator] Master Index:');
            console.log(JSON.stringify(index, null, 2));
        }
        else {
            console.log('[aggregator] Publishing Master Index to GitHub...');
            const releaser = new MasterReleaser(token);
            const releaseUrl = await releaser.publishLatest(JSON.stringify(index, null, 2));
            console.log(`[aggregator] Published: ${releaseUrl}`);
            // Export for GitHub Actions
            if (process.env.GITHUB_ENV) {
                const { appendFile } = await import('fs/promises');
                await appendFile(process.env.GITHUB_ENV, `RELEASE_URL=${releaseUrl}\n`);
            }
            // Send success notification
            if (webhookUrl) {
                const notifier = new DiscordNotifier(webhookUrl);
                await notifier.notify({
                    type: 'success',
                    source: 'aggregator',
                    timestamp: new Date().toISOString(),
                    stats: {
                        sources: index.totalSources,
                        totalSize: 0, // Not applicable for index
                        releaseUrl
                    }
                }, { warnings }).catch(console.error);
            }
        }
        console.log('[aggregator] Complete');
    }
    catch (error) {
        console.error('[aggregator] Failed:', error);
        // Send failure notification
        if (webhookUrl) {
            const notifier = new DiscordNotifier(webhookUrl);
            await notifier.notify({
                type: 'failure',
                source: 'aggregator',
                timestamp: new Date().toISOString(),
                error: error instanceof Error ? error.message : 'Unknown error'
            }).catch(console.error);
        }
        process.exit(1);
    }
}
// Run if executed directly
runAggregator();
