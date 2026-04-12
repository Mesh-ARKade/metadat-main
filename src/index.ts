/**
 * metadat-main - Master Manifest Aggregator (Index Model)
 *
 * @intent Coordinate discovery and release of the Master Index
 * @guarantee Aggregates URLs from all metadat repos without content manipulation
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
export async function runAggregator(): Promise<void> {
  const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || '';
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL || '';
  const dryRun = process.argv.includes('--dry-run');
  const notifySuccess = process.argv.includes('--notify-success');
  const notifyFailure = process.argv.includes('--notify-failure');

  // Handle explicit notification-only calls from workflow
  if (notifySuccess || notifyFailure) {
    if (!webhookUrl) process.exit(0);
    const notifier = new DiscordNotifier(webhookUrl);
    await notifier.notify({
      type: notifySuccess ? 'success' : 'failure',
      source: 'aggregator',
      timestamp: new Date().toISOString()
    }).catch(console.error);
    process.exit(0);
  }

  console.log('[aggregator] Starting master index aggregation...');
  console.log(`[aggregator] Sources: ${SOURCES.join(', ')}`);

  // Note: No "started" notification - only send final result with stats

  try {
    // Step 1: Locate manifests from all sources
    console.log('[aggregator] Locating manifests...');
    const fetcher = new ManifestFetcher(token);
    const releases = await fetcher.locateLatestManifests(SOURCES);
    console.log(`[aggregator] Located ${releases.length} manifests`);

    if (releases.length === 0) {
      throw new Error('No manifests located - cannot create master index');
    }

    // Step 2: Build the Master Index
    console.log('[aggregator] Building Index...');
    const aggregator = new ManifestAggregator();
    const index = aggregator.stitch(releases);
    
    console.log(`[aggregator] Index built: ${index.totalSources} sources indexed`);
    
    // Step 3: Publish the Master Index to GitHub
    if (dryRun) {
      console.log('[aggregator] Dry run - skipping release');
      console.log('[aggregator] Master Index:');
      console.log(JSON.stringify(index, null, 2));
    } else {
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
            releaseUrl
          }
        }).catch(console.error);
      }
    }

    console.log('[aggregator] Complete');
  } catch (error) {
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
