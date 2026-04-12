/**
 * Discord Notifier
 *
 * @intent Send pipeline notifications to Discord webhook with S8 "Stats for Nerds" format
 * @guarantee Posts rich embed with color-coded status, stats table, timestamps, and warnings
 */
export interface NotificationOptions {
    warnings?: string[];
}
export declare class DiscordNotifier {
    private webhookUrl;
    private maxRetries;
    constructor(webhookUrl: string);
    /**
     * Send notification to Discord
     */
    notify(event: any, options?: NotificationOptions): Promise<void>;
    private getEventTitle;
    private getEventColor;
    private formatStatsTable;
    private sendWithRetry;
}
