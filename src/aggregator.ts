/**
 * Manifest Aggregator
 *
 * @intent Stitch multiple source manifests into a unified master manifest
 * @guarantee Produces MasterManifest with aggregated totals, drops invalid sources
 */

import { ZodError } from 'zod';
import type { SourceManifest, MasterManifest, SourceInfo, ArtifactInfo } from './types.js';
import { validateSourceManifest, SourceManifestSchema } from './types.js';

export interface BouncerResult {
  master: MasterManifest;
  droppedSources: Array<{
    name: string;
    error: string;
  }>;
}

export class ManifestAggregator {
  /**
   * Combine multiple source manifests into a master manifest with Bouncer validation
   * @param manifests Array of source manifests to stitch
   * @returns BouncerResult with master manifest and any dropped sources
   */
  stitch(manifests: SourceManifest[]): BouncerResult {
    const allSources: SourceInfo[] = [];
    let totalSystems = 0;
    let totalArtifacts = 0;
    let totalSize = 0;
    const droppedSources: Array<{ name: string; error: string }> = [];

    // Collect all sources from all manifests with validation
    const allSystems = new Set<string>();
    
    for (const manifest of manifests) {
      // Validate this manifest using the Bouncer
      try {
        validateSourceManifest(manifest);
      } catch (err) {
        if (err instanceof ZodError) {
          const errorMsg = err.errors.map(e => `${e.path.join('.')}: ${e.message}`).join('; ');
          droppedSources.push({
            name: manifest.sources[0]?.name || 'unknown',
            error: errorMsg
          });
          console.warn(`[bouncer] Dropped source ${manifest.sources[0]?.name}: ${errorMsg}`);
          continue; // Skip this invalid manifest
        }
        throw err;
      }
      
      // Manifest is valid, add its sources
      for (const source of manifest.sources) {
        // Add artifacts to totals
        for (const artifact of source.artifacts) {
          totalArtifacts++;
          totalSize += artifact.size;
          
          // Track unique system IDs
          for (const system of artifact.systems) {
            allSystems.add(system.id);
          }
        }
        
        allSources.push(source);
      }
    }

    totalSystems = allSystems.size;

    const master: MasterManifest = {
      version: '1.0.0',
      generated: new Date().toISOString(),
      sources: allSources,
      totalSystems,
      totalArtifacts,
      totalSize
    };

    return { master, droppedSources };
  }
}