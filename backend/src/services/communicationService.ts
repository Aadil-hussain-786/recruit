import { callOpenRouter } from './aiWrapper';

export const communicationService = {
    /**
     * Send email to candidate (Placeholder)
     */
    async sendEmail(to: string, subject: string, content: string): Promise<boolean> {
        console.log(`Sending email to ${to}: ${subject}`);
        return true;
    },

    /**
     * Send WhatsApp/SMS (Placeholder)
     */
    async sendSMS(to: string, message: string): Promise<boolean> {
        console.log(`Sending SMS to ${to}: ${message}`);
        return true;
    },

    /**
     * Generate AI response suggestion for a candidate message
     */
    async suggestResponse(candidateProfile: any, jobRequirements: string, context: string): Promise<string> {
        const systemPrompt = "You are an expert recruitment coordinator. Write helpful, concise, and professional responses.";

        const userPrompt = `
            Candidate: ${candidateProfile.firstName} ${candidateProfile.lastName}
            Role: ${candidateProfile.currentTitle}
            Skills: ${candidateProfile.skills.join(', ')}
            Requirements: ${jobRequirements}
            Context: ${context}
            Suggest a professional response.
        `;

        try {
            return await callOpenRouter([
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
            ]);
        } catch (error) {
            console.error('Error generating response suggestion:', error);
            return '';
        }
    }
};
