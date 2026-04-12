/**
 * Core type definitions for metadat-main (Strict Index Model)
 */

/**
 * Schema for the Master Index Manifest
 */
export interface MasterIndex {
  version: string;
  generated: string;
  sources: Array<{
    name: string;
    manifestUrl: string;
    repo: string;
    lastUpdated: string;
  }>;
  totalSources: number;
}
