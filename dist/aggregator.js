/**
 * Manifest Aggregator (Index Model)
 *
 * @intent Build a master index of healthy source manifests
 * @guarantee Only includes sources that pass Bouncer validation
 */
import { ZodError } from 'zod';
import { SourceManifestSchema } from './types.js';
export class ManifestAggregator {
    /**
     * Stitch valid source manifests into a master index
     */
    stitch(manifests) {
        const validSources = [];
        const droppedSources = [];
        for (const item of manifests) {
            try {
                // Run the Bouncer: validate the downloaded manifest
                SourceManifestSchema.parse(item.manifest);
                // If valid, add to index
                validSources.push({
                    name: item.name,
                    manifestUrl: item.url,
                    repo: item.repo,
                    status: 'healthy',
                    lastVerified: new Date().toISOString()
                });
            }
            catch (error) {
                let msg = 'Unknown validation error';
                if (error instanceof ZodError) {
                    msg = error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join('; ');
                }
                else if (error instanceof Error) {
                    msg = error.message;
                }
                console.error(`[bouncer] Dropped source ${item.name}: ${msg}`);
                droppedSources.push({ name: item.name, error: msg });
            }
        }
        const index = {
            version: '1.1.0',
            generated: new Date().toISOString(),
            sources: validSources,
            totalSources: validSources.length
        };
        return { index, droppedSources };
    }
}
