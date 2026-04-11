/**
 * TypeScript Types for metadat-main
 *
 * @intent Define types for manifest aggregation
 * @guarantee Follows manifest v1 schema
 */

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