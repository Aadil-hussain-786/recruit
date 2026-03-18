import { PostHog } from 'posthog-node';
import dotenv from 'dotenv';

dotenv.config();

const client = process.env.POSTHOG_API_KEY 
    ? new PostHog(process.env.POSTHOG_API_KEY, { host: 'https://app.posthog.com' })
    : null;

export const analyticsService = {
    /**
     * Capture an event
     */
    capture(distinctId: string, event: string, properties?: any) {
        if (!client) return;
        
        try {
            client.capture({
                distinctId,
                event,
                properties: {
                    ...properties,
                    environment: process.env.NODE_ENV || 'development',
                    platform: 'Recruit AI Backend'
                }
            });
            console.log(`[Analytics] Tracked ${event} for ${distinctId}`);
        } catch (error) {
            console.error('[Analytics] Capture error:', error);
        }
    },

    /**
     * Track candidate conversion
     */
    trackCandidateUpload(userId: string, candidateId: string, source: string) {
        this.capture(userId, 'candidate_uploaded', {
            candidateId,
            source
        });
    },

    /**
     * Track AI Interview completion
     */
    trackInterviewCompleted(candidateId: string, score: number) {
        this.capture(candidateId, 'interview_completed', {
            score
        });
    },

    /**
     * Flush and shutdown (use on server shutdown)
     */
    async shutdown() {
        if (client) {
            await client.shutdown();
        }
    }
};
