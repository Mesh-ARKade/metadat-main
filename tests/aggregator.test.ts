/**
 * Manifest Aggregator Tests
 *
 * Tests for stitching multiple manifests into a master manifest including Bouncer validation
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
              { name: 'nointro-nintendo.jsonl.zst', url: 'https://example.com/1', size: 1000, sha256: 'a'.repeat(64), systems: [{ id: 'nintendo', name: 'Nintendo', gameCount: 100 }] }
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
              { name: 'tosec-sega.jsonl.zst', url: 'https://example.com/2', size: 2000, sha256: 'b'.repeat(64), systems: [{ id: 'sega', name: 'Sega', gameCount: 50 }] }
            ]
          }]
        }
      ];

      const result = aggregator.stitch(sourceManifests as any);

      // Should return BouncerResult with master
      expect(result).toHaveProperty('master');
      expect(result.master).toHaveProperty('version', '1.0.0');
      expect(result.master).toHaveProperty('generated');
      expect(result.master).toHaveProperty('sources');
      expect(result.master.sources).toHaveLength(2);
      expect(result.master).toHaveProperty('totalSystems');
      expect(result.master).toHaveProperty('totalArtifacts');
      expect(result.master).toHaveProperty('totalSize');
      
      // Should have no dropped sources for valid input
      expect(result.droppedSources).toHaveLength(0);
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
              { name: 'a.zst', url: 'https://a.com', size: 100, sha256: 'a'.repeat(64), systems: [{ id: 'n', name: 'N', gameCount: 10 }] },
              { name: 'b.zst', url: 'https://b.com', size: 200, sha256: 'b'.repeat(64), systems: [{ id: 's', name: 'S', gameCount: 20 }] }
            ]
          }]
        }
      ];

      const result = aggregator.stitch(sourceManifests as any);
      
      expect(result.master.totalArtifacts).toBe(2);
      expect(result.master.totalSize).toBe(300);
      expect(result.master.totalSystems).toBe(2);
    });

    it('should drop invalid manifests and track dropped sources', () => {
      const aggregator = new ManifestAggregator();
      
      const sourceManifests = [
        // Valid manifest
        {
          version: '1.0.0',
          generated: '2024-01-01T00:00:00Z',
          sources: [{
            name: 'no-intro',
            repo: 'Mesh-ARKade/metadat-nointro',
            release: 'nointro-2024-01-01',
            date: '2024-01-01',
            artifacts: [
              { name: 'a.zst', url: 'https://a.com', size: 100, sha256: 'a'.repeat(64), systems: [{ id: 'n', name: 'N', gameCount: 10 }] }
            ]
          }]
        },
        // Invalid manifest - missing required fields
        {
          version: '1.0.0',
          generated: '2024-01-01T00:00:00Z',
          sources: [{
            name: 'invalid-source' as any, // Invalid source name
            repo: 'Mesh-ARKade/metadat-invalid',
            release: 'invalid-2024-01-01',
            date: '2024-01-01',
            artifacts: [] // Empty artifacts - should fail validation
          }]
        }
      ];

      const result = aggregator.stitch(sourceManifests as any);
      
      // Should have 1 source from valid manifest
      expect(result.master.sources).toHaveLength(1);
      expect(result.master.sources[0].name).toBe('no-intro');
      
      // Should have dropped 1 source
      expect(result.droppedSources).toHaveLength(1);
      expect(result.droppedSources[0].name).toBe('invalid-source');
    });
  });
});