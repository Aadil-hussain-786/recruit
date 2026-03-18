import { v4 as uuidv4 } from 'uuid';
import Application from '../models/Application';
import Interview from '../models/Interview';

export const schedulingService = {
    /**
     * Create a scheduling link for an application
     */
    async createSchedulingLink(applicationId: string, organizationId: string): Promise<string> {
        const linkId = uuidv4();
        const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        return `${baseUrl}/schedule/${linkId}?appId=${applicationId}`;
    },

    /**
     * Get available slots based on interviewer calendar (Mock)
     */
    async getAvailableSlots(interviewerId: string): Promise<any> {
        const now = new Date();
        const slots: Date[] = [];
        for (let i = 1; i <= 3; i++) {
            const date = new Date(now);
            date.setDate(now.getDate() + i);
            date.setHours(10, 0, 0, 0);
            slots.push(new Date(date));
            date.setHours(14, 0, 0, 0);
            slots.push(new Date(date));
        }
        return slots;
    },

    /**
     * Confirm a slot and create an Interview record (Mongoose)
     */
    async confirmInterview(applicationId: string, interviewerId: string, slot: Date, organizationId?: string): Promise<any> {
        // Find the application - if organizationId is provided, use it for security, 
        // otherwise derive it from the application record
        const query = organizationId ? { _id: applicationId, organization: organizationId } : { _id: applicationId };
        const application = await Application.findOne(query)
            .populate('job')
            .populate('candidate');

        if (!application) {
            throw new Error('Application not found');
        }

        const interview = await Interview.create({
            application: application._id,
            job: (application as any).job,
            candidate: (application as any).candidate,
            scheduledAt: slot,
            duration: 45,
            status: 'scheduled',
            meetingLink: 'https://meet.google.com/mock-link',
            interviewers: [interviewerId],
            createdBy: interviewerId,
            organization: application.organization, // Use organization from application
        });

        return interview;
    }
};
