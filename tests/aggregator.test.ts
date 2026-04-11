/**
 * Manifest Aggregator Tests
 *
 * Tests for stitching multiple manifests into a master manifest
 */

import { describe, it, expect } from 'vitest';
import { ManifestAggregator } from '../src/aggregator.js';

describe('ManifestAggregator', () => {
  describe('stitch', () => {
    it('should combine multiple source manifests', () => {
      const aggregator = new ManifestAggregator();
      
      const sourceManifests = [
        {
          version: '1.0.0',
          generated: '2024-01-01T00:00:00Z',
          sources: [{
            name: 'no-intro',
            repo: 'Mesh-ARKade/metadat-nointro',
            release: 'nointro-2024-01-01',
            date: '2024-01-01',
            artifacts: [
              { name: 'nointro-nintendo.jsonl.zst', url: 'https://example.com/1', size: 1000, sha256: 'abc', systems: [{ id: 'nintendo', name: 'Nintendo', gameCount: 100 }] }
            ]
          }]
        },
        {
          version: '1.0.0',
          generated: '2024-01-01T00:00:00Z',
          sources: [{
            name: 'tosec',
            repo: 'Mesh-ARKade/metadat-tosec',
            release: 'tosec-2024-01-01',
            date: '2024-01-01',
            artifacts: [
              { name: 'tosec-sega.jsonl.zst', url: 'https://example.com/2', size: 2000, sha256: 'def', systems: [{ id: 'sega', name: 'Sega', gameCount: 50 }] }
            ]
          }]
        }
      ];

      const master = aggregator.stitch(sourceManifests as any);

      // Should have wrapped structure
      expect(master).toHaveProperty('version', '1.0.0');
      expect(master).toHaveProperty('generated');
      expect(master).toHaveProperty('sources');
      expect(master.sources).toHaveLength(2);
      expect(master).toHaveProperty('totalSystems');
      expect(master).toHaveProperty('totalArtifacts');
      expect(master).toHaveProperty('totalSize');
    });

    it('should calculate totals correctly', () => {
      const aggregator = new ManifestAggregator();
      
      const sourceManifests = [
        {
          version: '1.0.0',
          generated: '2024-01-01T00:00:00Z',
          sources: [{
            name: 'no-intro',
            repo: 'Mesh-ARKade/metadat-nointro',
            release: 'nointro-2024-01-01',
            date: '2024-01-01',
            artifacts: [
              { name: 'a.zst', url: 'https://a.com', size: 100, sha256: 'a', systems: [{ id: 'n', name: 'N', gameCount: 10 }] },
              { name: 'b.zst', url: 'https://b.com', size: 200, sha256: 'b', systems: [{ id: 's', name: 'S', gameCount: 20 }] }
            ]
          }]
        }
      ];

      const master = aggregator.stitch(sourceManifests as any);
      
      expect(master.totalArtifacts).toBe(2);
      expect(master.totalSize).toBe(300);
      expect(master.totalSystems).toBe(2);
    });
  });
});