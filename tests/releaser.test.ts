/**
 * Master Releaser Tests
 *
 * Tests for publishing master manifest to GitHub release
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockRepos, mockOctokit } = vi.hoisted(() => {
  const mockRepos = {
    getLatestRelease: vi.fn(),
    createRelease: vi.fn(),
    deleteRelease: vi.fn(),
    uploadReleaseAsset: vi.fn()
  };
  
  const mockOctokit = vi.fn().mockImplementation(() => ({
    repos: mockRepos
  }));
  
  return { mockRepos, mockOctokit };
});

vi.mock('@octokit/rest', () => ({
  Octokit: mockOctokit
}));

import { MasterReleaser } from '../src/releaser.js';

describe('MasterReleaser', () => {
  let releaser: MasterReleaser;

  beforeEach(() => {
    vi.clearAllMocks();
    releaser = new MasterReleaser('fake-token');
  });

  describe('publishLatest', () => {
    it('should create new release with manifest', async () => {
      // No existing release
      mockRepos.getLatestRelease.mockRejectedValue({ status: 404 });
      mockRepos.createRelease.mockResolvedValue({
        data: { id: 123, html_url: 'https://github.com/Mesh-ARKade/metadat-main/releases/tag/latest' }
      });
      mockRepos.uploadReleaseAsset.mockResolvedValue({ data: { name: 'master-manifest.json' } });

      const manifest = JSON.stringify({ version: '1.0.0', sources: [] });
      const result = await releaser.publishLatest(manifest);

      expect(result).toContain('releases/tag/latest');
      expect(mockRepos.createRelease).toHaveBeenCalled();
    });

    it('should overwrite existing release', async () => {
      // Has existing release
      mockRepos.getLatestRelease.mockResolvedValue({
        data: { id: 456, tag_name: 'latest', assets: [{ name: 'master-manifest.json', id: 999 }] }
      });
      mockRepos.deleteRelease.mockResolvedValue({});
      mockRepos.createRelease.mockResolvedValue({
        data: { id: 789, html_url: 'https://github.com/Mesh-ARKade/metadat-main/releases/tag/latest' }
      });

      const manifest = JSON.stringify({ version: '1.0.0', sources: [] });
      const result = await releaser.publishLatest(manifest);

      expect(mockRepos.deleteRelease).toHaveBeenCalled();
      expect(result).toContain('latest');
    });
  });
});