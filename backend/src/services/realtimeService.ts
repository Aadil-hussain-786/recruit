import * as Ably from 'ably';
import dotenv from 'dotenv';

dotenv.config();

const ABLY_KEY = process.env.ABLY_API_KEY || '';

const client = ABLY_KEY ? new Ably.Rest(ABLY_KEY) : null;

export const realtimeService = {
    /**
     * Publish a message to a channel
     */
    async publish(channelName: string, eventName: string, data: any) {
        if (!client) return;

        try {
            const channel = client.channels.get(channelName);
            await channel.publish(eventName, data);
            console.log(`[Realtime] Published ${eventName} to ${channelName}`);
        } catch (error) {
            console.error('[Realtime] Publish error:', error);
        }
    },

    /**
     * Broadcast an agent action to the dashboard activity feed
     */
    async logActivity(organizationId: string, action: string, details: string) {
        return this.publish(`org-${organizationId}`, 'activity', {
            timestamp: new Date().toISOString(),
            action,
            details
        });
    }
};
