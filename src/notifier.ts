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
  footer?: { text: string };
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
 * S8 color palette
 */
const COLORS = {
  started: 0xffff00,   // 🟡 Yellow
  success: 0x00ff00,   // 🟢 Green  
  failure: 0xff0000,   // 🔴 Red
  warning: 0xffa500    // 🟠 Orange
};

/**
 * Send notifications to Discord
 */
export class DiscordNotifier {
  private webhookUrl: string;
  private maxRetries = 3;
  private retryDelay = 1000;

  /**
   * @param webhookUrl Discord webhook URL
   */
  constructor(webhookUrl: string) {
    this.webhookUrl = webhookUrl;
  }

  /**
   * Send notification to Discord
   * @param event Pipeline event with type and data
   * @param options Additional options like warnings
   */
  async notify(event: PipelineEvent, options?: NotificationOptions): Promise<void> {
    if (!this.webhookUrl) {
      console.log('[notifier] No webhook URL configured - skipping');
      return;
    }

    const message = this.buildMessage(event, options);
    await this.sendWithRetry(message);
  }

  /**
   * Build Discord embed message from event
   */
  private buildMessage(event: PipelineEvent, options?: NotificationOptions): DiscordMessage {
    const color = this.getColor(event.type, options?.warnings);
    const emoji = this.getEmoji(event.type);
    const title = `${emoji} ${event.source} pipeline ${event.type}`;
    
    // Add warning prefix to title if there are warnings
    const finalTitle = options?.warnings?.length 
      ? `⚠️ ${title} (${options.warnings.length} warning(s))` 
      : title;
    
    const fields: DiscordField[] = [
      { name: 'Source', value: event.source, inline: true },
      { name: 'Type', value: event.type, inline: true },
      { name: 'Time', value: new Date(event.timestamp).toISOString(), inline: true }
    ];

    // Add warnings field if present
    if (options?.warnings && options.warnings.length > 0) {
      fields.push({
        name: '⚠️ Warnings',
        value: options.warnings.join('\n'),
        inline: false
      });
    }

    // Add stats for success
    if (event.type === 'success' && 'stats' in event) {
      const stats = event.stats as any;
      fields.push(
        { name: 'Sources', value: String(stats.sources || 0), inline: true },
        { name: 'Artifacts', value: String(stats.artifacts || 0), inline: true },
        { name: 'Systems', value: String(stats.systems || 0), inline: true }
      );
      
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
        title: finalTitle,
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
  private getColor(type: string, warnings?: string[]): number {
    // If there are warnings, use warning color
    if (warnings && warnings.length > 0) {
      return COLORS.warning;
    }
    return COLORS[type as keyof typeof COLORS] || 0x808080;
  }

  /**
   * Get emoji for event type
   */
  private getEmoji(type: string): string {
    const emojis: Record<string, string> = {
      started: '🟡',
      success: '🟢',
      failure: '🔴'
    };
    return emojis[type] || '⚪';
  }

  /**
   * Send message with retry logic
   */
  private async sendWithRetry(message: DiscordMessage): Promise<void> {
    let lastError: Error | null = null;
    
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
      } catch (error) {
        lastError = error as Error;
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
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}