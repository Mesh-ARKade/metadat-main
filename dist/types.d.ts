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
/**
 * Zod schema for SystemInfo
 */
export declare const SystemInfoSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    gameCount: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    id: string;
    name: string;
    gameCount: number;
}, {
    id: string;
    name: string;
    gameCount: number;
}>;
/**
 * Zod schema for ArtifactInfo
 */
export declare const ArtifactInfoSchema: z.ZodObject<{
    name: z.ZodString;
    url: z.ZodString;
    size: z.ZodNumber;
    sha256: z.ZodString;
    systems: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        gameCount: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        id: string;
        name: string;
        gameCount: number;
    }, {
        id: string;
        name: string;
        gameCount: number;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    name: string;
    url: string;
    size: number;
    sha256: string;
    systems: {
        id: string;
        name: string;
        gameCount: number;
    }[];
}, {
    name: string;
    url: string;
    size: number;
    sha256: string;
    systems: {
        id: string;
        name: string;
        gameCount: number;
    }[];
}>;
/**
 * Zod schema for SourceInfo
 */
export declare const SourceInfoSchema: z.ZodObject<{
    name: z.ZodEnum<["no-intro", "tosec", "redump", "mame"]>;
    repo: z.ZodString;
    release: z.ZodString;
    date: z.ZodString;
    artifacts: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        url: z.ZodString;
        size: z.ZodNumber;
        sha256: z.ZodString;
        systems: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            name: z.ZodString;
            gameCount: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            id: string;
            name: string;
            gameCount: number;
        }, {
            id: string;
            name: string;
            gameCount: number;
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        name: string;
        url: string;
        size: number;
        sha256: string;
        systems: {
            id: string;
            name: string;
            gameCount: number;
        }[];
    }, {
        name: string;
        url: string;
        size: number;
        sha256: string;
        systems: {
            id: string;
            name: string;
            gameCount: number;
        }[];
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    name: "no-intro" | "tosec" | "redump" | "mame";
    date: string;
    repo: string;
    release: string;
    artifacts: {
        name: string;
        url: string;
        size: number;
        sha256: string;
        systems: {
            id: string;
            name: string;
            gameCount: number;
        }[];
    }[];
}, {
    name: "no-intro" | "tosec" | "redump" | "mame";
    date: string;
    repo: string;
    release: string;
    artifacts: {
        name: string;
        url: string;
        size: number;
        sha256: string;
        systems: {
            id: string;
            name: string;
            gameCount: number;
        }[];
    }[];
}>;
/**
 * Zod schema for SourceManifest
 */
export declare const SourceManifestSchema: z.ZodObject<{
    version: z.ZodString;
    generated: z.ZodString;
    sources: z.ZodArray<z.ZodObject<{
        name: z.ZodEnum<["no-intro", "tosec", "redump", "mame"]>;
        repo: z.ZodString;
        release: z.ZodString;
        date: z.ZodString;
        artifacts: z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            url: z.ZodString;
            size: z.ZodNumber;
            sha256: z.ZodString;
            systems: z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                name: z.ZodString;
                gameCount: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                id: string;
                name: string;
                gameCount: number;
            }, {
                id: string;
                name: string;
                gameCount: number;
            }>, "many">;
        }, "strip", z.ZodTypeAny, {
            name: string;
            url: string;
            size: number;
            sha256: string;
            systems: {
                id: string;
                name: string;
                gameCount: number;
            }[];
        }, {
            name: string;
            url: string;
            size: number;
            sha256: string;
            systems: {
                id: string;
                name: string;
                gameCount: number;
            }[];
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        name: "no-intro" | "tosec" | "redump" | "mame";
        date: string;
        repo: string;
        release: string;
        artifacts: {
            name: string;
            url: string;
            size: number;
            sha256: string;
            systems: {
                id: string;
                name: string;
                gameCount: number;
            }[];
        }[];
    }, {
        name: "no-intro" | "tosec" | "redump" | "mame";
        date: string;
        repo: string;
        release: string;
        artifacts: {
            name: string;
            url: string;
            size: number;
            sha256: string;
            systems: {
                id: string;
                name: string;
                gameCount: number;
            }[];
        }[];
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    version: string;
    generated: string;
    sources: {
        name: "no-intro" | "tosec" | "redump" | "mame";
        date: string;
        repo: string;
        release: string;
        artifacts: {
            name: string;
            url: string;
            size: number;
            sha256: string;
            systems: {
                id: string;
                name: string;
                gameCount: number;
            }[];
        }[];
    }[];
}, {
    version: string;
    generated: string;
    sources: {
        name: "no-intro" | "tosec" | "redump" | "mame";
        date: string;
        repo: string;
        release: string;
        artifacts: {
            name: string;
            url: string;
            size: number;
            sha256: string;
            systems: {
                id: string;
                name: string;
                gameCount: number;
            }[];
        }[];
    }[];
}>;
/**
 * Validate a source manifest against the v1 schema
 * @param manifest Manifest to validate
 * @returns True if valid, throws ZodError if invalid
 */
export declare function validateSourceManifest(manifest: unknown): boolean;
