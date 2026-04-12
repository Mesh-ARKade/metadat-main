/**
 * TypeScript Types for metadat-main
 *
 * @intent Define types for manifest aggregation
 * @guarantee Follows manifest v1 schema
 */
import { z } from 'zod';
// ============================================================================
// Zod Schemas for Manifest Bouncer
// ============================================================================
/**
 * Zod schema for SystemInfo
 */
export const SystemInfoSchema = z.object({
    id: z.string().min(1),
    name: z.string().min(1),
    gameCount: z.number().int().nonnegative()
});
/**
 * Zod schema for ArtifactInfo
 */
export const ArtifactInfoSchema = z.object({
    name: z.string().min(1),
    url: z.string().url(),
    size: z.number().int().nonnegative(),
    sha256: z.string().length(64),
    systems: z.array(SystemInfoSchema).min(1)
});
/**
 * Zod schema for SourceInfo
 */
export const SourceInfoSchema = z.object({
    name: z.enum(['no-intro', 'tosec', 'redump', 'mame']),
    repo: z.string().min(1),
    release: z.string().min(1),
    date: z.string(), // ISO date string
    artifacts: z.array(ArtifactInfoSchema).min(1)
});
/**
 * Zod schema for SourceManifest
 */
export const SourceManifestSchema = z.object({
    version: z.string().min(1),
    generated: z.string().datetime(),
    sources: z.array(SourceInfoSchema).min(1)
});
/**
 * Validate a source manifest against the v1 schema
 * @param manifest Manifest to validate
 * @returns True if valid, throws ZodError if invalid
 */
export function validateSourceManifest(manifest) {
    SourceManifestSchema.parse(manifest);
    return true;
}
