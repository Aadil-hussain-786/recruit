import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const CAL_API_KEY = process.env.CAL_API_KEY || '';

export const schedulingIntegrationService = {
    /**
     * Create a booking link for a candidate
     * (Integrates with Cal.com API)
     */
    async createBookingLink(recruiterEmail: string, candidateEmail: string, eventTypeId: string) {
        if (!CAL_API_KEY) {
            // Fallback to a static link if API key is missing
            return `https://cal.com/${recruiterEmail.split('@')[0]}/interview`;
        }

        try {
            // Note: This is an example of calling Cal.com's API to create a unique booking UID
            // Real implementation would depend on your specific organization setup in Cal.com
            const response = await axios.post('https://api.cal.com/v1/bookings', {
                eventTypeId,
                start: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
                responses: {
                    email: candidateEmail,
                    name: 'Neural Candidate'
                }
            }, {
                params: { apiKey: CAL_API_KEY }
            });

            return response.data.booking.shortUrl;
        } catch (error) {
            console.error('[Scheduling] Failed to create link:', error);
            return `https://cal.com/${recruiterEmail.split('@')[0]}/interview`;
        }
    }
};
