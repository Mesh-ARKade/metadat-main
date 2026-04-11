/**
 * metadat-main - Master Manifest Aggregator
 *
 * @intent Coordinate fetching, aggregating, and releasing master manifest
 * @guarantee Pulls from all metadat repos, stitches, and publishes to latest release
 */

import { ManifestFetcher } from './fetcher.js';
import { ManifestAggregator } from './aggregator.js';
import { MasterReleaser } from './releaser.js';
import { DiscordNotifier } from './notifier.js';
import type { MasterManifest } from './types.js';

// Configured sources to aggregate
const SOURCES = ['nointro', 'tosec', 'redump', 'mame'];

/**
 * Run the aggregation pipeline
 */
export async function runAggregator(): Promise<void> {
  const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || '';
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL || '';
  const dryRun = process.argv.includes('--dry-run');

  console.log('[aggregator] Starting master manifest aggregation...');
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
    // Step 1: Fetch manifests from all sources
    console.log('[aggregator] Fetching manifests...');
    const fetcher = new ManifestFetcher(token);
    const manifests = await fetcher.fetchLatestManifests(SOURCES);
    console.log(`[aggregator] Fetched ${manifests.length} manifests`);

    if (manifests.length === 0) {
      throw new Error('No manifests fetched - cannot create master manifest');
    }

    // Step 2: Aggregate into master manifest
    console.log('[aggregator] Aggregating...');
    const aggregator = new ManifestAggregator();
    const master = aggregator.stitch(manifests);
    console.log(`[aggregator] Master: ${master.totalArtifacts} artifacts, ${master.totalSystems} systems, ${master.totalSize} bytes`);

    // Step 3: Publish to GitHub release
    if (dryRun) {
      console.log('[aggregator] Dry run - skipping release');
      console.log('[aggregator] Master manifest:');
      console.log(JSON.stringify(master, null, 2));
    } else {
      console.log('[aggregator] Publishing to GitHub...');
      const releaser = new MasterReleaser(token);
      const releaseUrl = await releaser.publishLatest(JSON.stringify(master, null, 2));
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
            sources: manifests.length,
            artifacts: master.totalArtifacts,
            systems: master.totalSystems,
            size: master.totalSize,
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