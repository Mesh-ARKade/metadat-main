/**
 * Discord Notifier
 *
 * @intent Send pipeline notifications to Discord webhook with S8 "Stats for Nerds" format
 * @guarantee Posts rich embed with color-coded status, stats table, timestamps, and warnings
 */
export class DiscordNotifier {
    webhookUrl;
    maxRetries = 3;
    constructor(webhookUrl) {
        this.webhookUrl = webhookUrl;
    }
    /**
     * Send notification to Discord
     */
    async notify(event, options = {}) {
        if (!this.webhookUrl)
            return;
        const embed = {
            title: this.getEventTitle(event.type, event.source),
            color: this.getEventColor(event.type, options.warnings?.length),
            timestamp: event.timestamp || new Date().toISOString(),
            fields: []
        };
        // Add source if applicable
        if (event.source && event.source !== 'aggregator') {
            embed.fields.push({ name: '📁 Source', value: event.source, inline: true });
        }
        // Add stats table if successful
        if (event.type === 'success' && event.stats) {
            const stats = [
                { metric: 'Healthy Sources', value: event.stats.sources?.toString() || '0' }
            ];
            embed.description = `**Master Index Updated**\n${this.formatStatsTable(stats)}`;
            if (event.stats.releaseUrl) {
                embed.url = event.stats.releaseUrl;
            }
        }
        // Add warnings if present
        if (options.warnings && options.warnings.length > 0) {
            embed.fields.push({
                name: `⚠️ Bouncer Dropped Sources (${options.warnings.length})`,
                value: options.warnings.join('\n'),
                inline: false
            });
        }
        // Add error if failed
        if (event.type === 'failure' && event.error) {
            embed.description = `**Pipeline Failed**\n\`\`\`\n${event.error}\n\`\`\``;
        }
        const payload = { embeds: [embed] };
        await this.sendWithRetry(payload);
    }
    getEventTitle(type, source) {
        const label = source.charAt(0).toUpperCase() + source.slice(1);
        switch (type) {
            case 'started': return `⏳ ${label} Started`;
            case 'success': return `✅ ${label} Complete`;
            case 'failure': return `🔴 ${label} Failed`;
            case 'skipped': return `⏭️ ${label} Skipped`;
            default: return `${label} Event`;
        }
    }
    getEventColor(type, warningCount) {
        if (type === 'failure')
            return 0xFF0000; // Red
        if (warningCount && warningCount > 0)
            return 0xFFA500; // Orange (Warning)
        if (type === 'success')
            return 0x00FF00; // Green
        if (type === 'started')
            return 0xFFFF00; // Yellow
        return 0x808080; // Grey
    }
    formatStatsTable(stats) {
        const rows = stats.map(s => `| ${s.metric} | ${s.value} |`).join('\n');
        return `\n${rows}\n`;
    }
    async sendWithRetry(payload, attempt = 1) {
        try {
            const response = await fetch(this.webhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (!response.ok) {
                throw new Error(`Discord webhook failed: ${response.status}`);
            }
        }
        catch (err) {
            if (attempt < this.maxRetries) {
                await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
                return this.sendWithRetry(payload, attempt + 1);
            }
            throw err;
        }
    }
}
