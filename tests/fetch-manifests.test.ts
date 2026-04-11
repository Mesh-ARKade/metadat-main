/**
 * Manifest Fetcher Tests
 *
 * Tests for fetching manifests from metadat repositories
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

// Use vi.hoisted to properly reference mocks
const { mockRepos, mockOctokit } = vi.hoisted(() => {
  const mockRepos = {
    getLatestRelease: vi.fn(),
    getReleaseAsset: vi.fn()
  };
  
  const mockOctokit = vi.fn().mockImplementation(() => ({
    repos: mockRepos
  }));
  
  return { mockRepos, mockOctokit };
});

// Mock Octokit before importing the fetcher
vi.mock('@octokit/rest', () => ({
  Octokit: mockOctokit
}));

// Now import after mocking
import { ManifestFetcher } from '../src/fetcher.js';

describe('ManifestFetcher', () => {
  let fetcher: ManifestFetcher;

  beforeEach(() => {
    vi.clearAllMocks();
    fetcher = new ManifestFetcher('fake-token');
  });

  describe('fetchLatestManifests', () => {
    it('should fetch manifest from source', async () => {
      const mockManifest = {
        version: '1.0.0',
        generated: '2024-01-01T00:00:00Z',
        sources: [{
          name: 'no-intro',
          repo: 'Mesh-ARKade/metadat-nointro',
          release: 'nointro-2024-01-01',
          date: '2024-01-01',
          artifacts: []
        }]
      };

      // Mock getLatestRelease
      mockRepos.getLatestRelease.mockResolvedValue({
        data: {
          assets: [{ name: 'manifest.json', browser_download_url: 'https://example.com/manifest.json', id: 123 }]
        }
      });

      // Mock fetch for downloading manifest content
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(JSON.stringify(mockManifest))
      });

      const sources = ['nointro'];
      const manifests = await fetcher.fetchLatestManifests(sources);

      expect(manifests).toHaveLength(1);
      expect(manifests[0].version).toBe('1.0.0');
    });

    it('should handle missing manifest gracefully', async () => {
      mockRepos.getLatestRelease.mockResolvedValue({
        data: { assets: [] } // No manifest.json
      });

      const sources = ['nointro'];
      const manifests = await fetcher.fetchLatestManifests(sources);

      expect(manifests).toHaveLength(0);
    });

    it('should skip sources with errors', async () => {
      mockRepos.getLatestRelease.mockRejectedValueOnce(new Error('Not found'));

      const sources = ['nointro'];
      const manifests = await fetcher.fetchLatestManifests(sources);

      expect(manifests).toHaveLength(0);
    });
  });
});