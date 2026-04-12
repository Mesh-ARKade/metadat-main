/**
 * Discord Notifier
 *
 * @intent Send pipeline notifications to Discord webhook with S8 "Stats for Nerds" format
 * @guarantee Posts rich embed with color-coded status, stats table, timestamps, and warnings
 */
import type { PipelineEvent } from './types.js';
export interface DiscordMessage {
    embeds: DiscordEmbed[];
}
export interface DiscordEmbed {
    title: string;
    description?: string;
    color: number;
    fields: DiscordField[];
    timestamp: string;
    footer?: {
        text: string;
    };
}
export interface DiscordField {
    name: string;
    value: string;
    inline?: boolean;
}
/**
 * Notification options including warnings
 */
export interface NotificationOptions {
    /** Warning messages to include (e.g., dropped sources from Bouncer) */
    warnings?: string[];
}
/**
 * Send notifications to Discord
 */
export declare class DiscordNotifier {
    private webhookUrl;
    private maxRetries;
    private retryDelay;
    /**
     * @param webhookUrl Discord webhook URL
     */
    constructor(webhookUrl: string);
    /**
     * Send notification to Discord
     * @param event Pipeline event with type and data
     * @param options Additional options like warnings
     */
    notify(event: PipelineEvent, options?: NotificationOptions): Promise<void>;
    /**
     * Build Discord embed message from event
     */
    private buildMessage;
    /**
     * Get color for event type
     */
    private getColor;
    /**
     * Get emoji for event type
     */
    private getEmoji;
    /**
     * Send message with retry logic
     */
    private sendWithRetry;
    /**
     * Sleep for ms milliseconds
     */
    private sleep;
}
