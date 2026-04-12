/**
 * Core type definitions for metadat-main (Index Model)
 */
import { z } from 'zod';
/**
 * Schema for individual source manifest validation (Bouncer)
 * This mirrors the schema used in the source repos
 */
export const SourceManifestSchema = z.object({
    version: z.string(),
    generated: z.string(),
    sources: z.array(z.object({
        name: z.enum(['no-intro', 'tosec', 'redump', 'mame', 'hbmame']),
        artifacts: z.array(z.object({
            name: z.string(),
            url: z.string().url(),
            size: z.number(),
            sha256: z.string()
        })).min(1)
    })).min(1)
});
