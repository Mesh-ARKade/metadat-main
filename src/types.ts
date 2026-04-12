/**
 * TypeScript Types for metadat-main
 *
 * @intent Define types for manifest aggregation
 * @guarantee Follows manifest v1 schema
 */

import { z } from 'zod';

export interface SourceManifest {
  version: string;
  generated: string;
  sources: SourceInfo[];
}

export interface SourceInfo {
  name: 'no-intro' | 'tosec' | 'redump' | 'mame';
  repo: string;
  release: string;
  date: string;
  artifacts: ArtifactInfo[];
}

export interface ArtifactInfo {
  name: string;
  url: string;
  size: number;
  sha256: string;
  systems: SystemInfo[];
}

export interface SystemInfo {
  id: string;
  name: string;
  gameCount: number;
}

export interface MasterManifest {
  version: string;
  generated: string;
  sources: SourceInfo[];
  totalSystems: number;
  totalArtifacts: number;
  totalSize: number;
}

/**
 * Pipeline event for Discord notifications
 */
export interface PipelineEvent {
  type: 'started' | 'success' | 'failure';
  source: string;
  timestamp: string;
  stats?: {
    sources: number;
    artifacts: number;
    systems: number;
    size: number;
    releaseUrl?: string;
  };
  error?: string;
}

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
export function validateSourceManifest(manifest: unknown): boolean {
  SourceManifestSchema.parse(manifest);
  return true;
}