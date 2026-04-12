/**
 * Core type definitions for metadat-main (Index Model)
 */
import { z } from 'zod';
/**
 * Schema for individual source manifest validation (Bouncer)
 * This mirrors the schema used in the source repos
 */
export declare const SourceManifestSchema: z.ZodObject<{
    version: z.ZodString;
    generated: z.ZodString;
    sources: z.ZodArray<z.ZodObject<{
        name: z.ZodEnum<["no-intro", "tosec", "redump", "mame", "hbmame"]>;
        artifacts: z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            url: z.ZodString;
            size: z.ZodNumber;
            sha256: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            name: string;
            url: string;
            size: number;
            sha256: string;
        }, {
            name: string;
            url: string;
            size: number;
            sha256: string;
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        name: "no-intro" | "tosec" | "redump" | "mame" | "hbmame";
        artifacts: {
            name: string;
            url: string;
            size: number;
            sha256: string;
        }[];
    }, {
        name: "no-intro" | "tosec" | "redump" | "mame" | "hbmame";
        artifacts: {
            name: string;
            url: string;
            size: number;
            sha256: string;
        }[];
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    version: string;
    generated: string;
    sources: {
        name: "no-intro" | "tosec" | "redump" | "mame" | "hbmame";
        artifacts: {
            name: string;
            url: string;
            size: number;
            sha256: string;
        }[];
    }[];
}, {
    version: string;
    generated: string;
    sources: {
        name: "no-intro" | "tosec" | "redump" | "mame" | "hbmame";
        artifacts: {
            name: string;
            url: string;
            size: number;
            sha256: string;
        }[];
    }[];
}>;
export type SourceManifest = z.infer<typeof SourceManifestSchema>;
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
        status: 'healthy' | 'degraded';
        lastVerified: string;
    }>;
    totalSources: number;
}
