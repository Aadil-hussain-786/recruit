import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

let resend: Resend | null = null;

const getResendClient = () => {
    if (resend) return resend;

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
        return null;
    }

    try {
        resend = new Resend(apiKey);
        return resend;
    } catch (error) {
        console.error('[Email] Failed to initialize Resend client:', error);
        return null;
    }
};

export const emailService = {
    /**
     * Send a transactional email
     */
    async sendEmail(to: string, subject: string, html: string) {
        try {
            const client = getResendClient();

            if (!client) {
                console.warn('[Email] Skipping email - Resend client not initialized (check RESEND_API_KEY)');
                return;
            }

            const { data, error } = await client.emails.send({
                from: 'Recruit AI <notifications@recruit-ai.works>',
                to,
                subject,
                html,
            });

            if (error) {
                console.error('[Email] Failed to send:', error);
                return { error };
            }

            console.log(`[Email] Sent to ${to} (ID: ${data?.id})`);
            return data;
        } catch (error) {
            console.error('[Email] Unexpected error sending email:', error);
        }
    },

    /**
     * Template: Candidate Interview Invitation
     */
    async sendInterviewInvite(candidateName: string, candidateEmail: string, jobTitle: string, inviteUrl: string) {
        const html = `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                <h2 style="color: #111; text-transform: uppercase; letter-spacing: 1px;">Interview Invitation</h2>
                <p>Hello ${candidateName},</p>
                <p>Congratulations! Your profile has been flagged as a high-potential match for the <strong>${jobTitle}</strong> position.</p>
                <p>Our AI selection agent has prepared a neural interview protocol for you to complete. This will help us understand your technical DNA better.</p>
                <div style="margin: 30px 0;">
                    <a href="${inviteUrl}" style="background: #000; color: #fff; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 5px; text-transform: uppercase; font-size: 12px; letter-spacing: 2px;">Begin Interview Protocol</a>
                </div>
                <p style="color: #666; font-size: 12px;">Protocol ID: ${Math.random().toString(36).substring(7).toUpperCase()}</p>
                <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
                <p style="font-size: 10px; color: #999; text-transform: uppercase; letter-spacing: 1px;">Automated by Recruit Engineering Works</p>
            </div>
        `;

        return this.sendEmail(candidateEmail, `Protocol Invitation: ${jobTitle}`, html);
    }
};
