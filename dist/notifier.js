/**
 * Discord Notifier
 *
 * @intent Send pipeline notifications to Discord webhook with S8 "Stats for Nerds" format
 * @guarantee Posts rich embed with color-coded status, stats table, and timestamps
 */
/**
 * S8 color palette
 */
const COLORS = {
    started: 0xffff00, // 🟡 Yellow
    success: 0x00ff00, // 🟢 Green  
    failure: 0xff0000 // 🔴 Red
};
/**
 * Send notifications to Discord
 */
export class DiscordNotifier {
    webhookUrl;
    maxRetries = 3;
    retryDelay = 1000;
    /**
     * @param webhookUrl Discord webhook URL
     */
    constructor(webhookUrl) {
        this.webhookUrl = webhookUrl;
    }
    /**
     * Send notification to Discord
     * @param event Pipeline event with type and data
     */
    async notify(event) {
        if (!this.webhookUrl) {
            console.log('[notifier] No webhook URL configured - skipping');
            return;
        }
        const message = this.buildMessage(event);
        await this.sendWithRetry(message);
    }
    /**
     * Build Discord embed message from event
     */
    buildMessage(event) {
        const color = this.getColor(event.type);
        const emoji = this.getEmoji(event.type);
        const title = `${emoji} ${event.source} pipeline ${event.type}`;
        const fields = [
            { name: 'Source', value: event.source, inline: true },
            { name: 'Type', value: event.type, inline: true },
            { name: 'Time', value: new Date(event.timestamp).toISOString(), inline: true }
        ];
        // Add stats for success
        if (event.type === 'success' && 'stats' in event) {
            const stats = event.stats;
            fields.push({ name: 'Sources', value: String(stats.sources || 0), inline: true }, { name: 'Artifacts', value: String(stats.artifacts || 0), inline: true }, { name: 'Systems', value: String(stats.systems || 0), inline: true });
            if (stats.releaseUrl) {
                fields.push({ name: 'Release', value: stats.releaseUrl, inline: false });
            }
        }
        // Add error for failure
        if (event.type === 'failure' && 'error' in event) {
            fields.push({ name: 'Error', value: String(event.error), inline: false });
        }
        return {
            embeds: [{
                    title,
                    color,
                    fields,
                    timestamp: new Date().toISOString(),
                    footer: { text: 'Mesh-ARKade metadat-main' }
                }]
        };
    }
    /**
     * Get color for event type
     */
    getColor(type) {
        return COLORS[type] || 0x808080;
    }
    /**
     * Get emoji for event type
     */
    getEmoji(type) {
        const emojis = {
            started: '🟡',
            success: '🟢',
            failure: '🔴'
        };
        return emojis[type] || '⚪';
    }
    /**
     * Send message with retry logic
     */
    async sendWithRetry(message) {
        let lastError = null;
        for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
            try {
                const response = await fetch(this.webhookUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(message)
                });
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }
                console.log('[notifier] Notification sent');
                return;
            }
            catch (error) {
                lastError = error;
                console.warn(`[notifier] Attempt ${attempt} failed:`, error);
                if (attempt < this.maxRetries) {
                    await this.sleep(this.retryDelay * attempt);
                }
            }
        }
        throw lastError || new Error('Failed to send notification');
    }
    /**
     * Sleep for ms milliseconds
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
