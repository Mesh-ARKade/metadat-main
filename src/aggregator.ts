/**
 * Manifest Aggregator
 *
 * @intent Stitch multiple source manifests into a unified master manifest
 * @guarantee Produces MasterManifest with aggregated totals
 */

import type { SourceManifest, MasterManifest, SourceInfo, ArtifactInfo } from './types.js';

export class ManifestAggregator {
  /**
   * Combine multiple source manifests into a master manifest
   * @param manifests Array of source manifests to stitch
   * @returns Unified master manifest
   */
  stitch(manifests: SourceManifest[]): MasterManifest {
    const allSources: SourceInfo[] = [];
    let totalSystems = 0;
    let totalArtifacts = 0;
    let totalSize = 0;

    // Collect all sources from all manifests
    for (const manifest of manifests) {
      for (const source of manifest.sources) {
        // Add artifacts to totals
        for (const artifact of source.artifacts) {
          totalArtifacts++;
          totalSize += artifact.size;
          totalSystems += artifact.systems.length;
        }
        
        allSources.push(source);
      }
    }

    const master: MasterManifest = {
      version: '1.0.0',
      generated: new Date().toISOString(),
      sources: allSources,
      totalSystems,
      totalArtifacts,
      totalSize
    };

    return master;
  }
}