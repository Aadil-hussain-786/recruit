import { Request, Response } from 'express';
import { communicationService } from '../services/communicationService';
import Candidate from '../models/Candidate';
import Job from '../models/Job';

// @desc    Send email to candidate
// @route   POST /api/communication/email
// @access  Private
export const sendCandidateEmail = async (req: Request, res: Response) => {
    try {
        const { candidateId, subject, message } = req.body;
        const candidate = await Candidate.findById(candidateId);

        if (!candidate) {
            return res.status(404).json({ success: false, message: 'Candidate not found' });
        }

        await communicationService.sendEmail(candidate.email, subject, message);

        res.status(200).json({
            success: true,
            message: 'Email sent successfully'
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: 'Error sending email' });
    }
};

// @desc    Get AI suggested response
// @route   POST /api/communication/suggest
// @access  Private
export const getAISuggestion = async (req: Request, res: Response) => {
    try {
        const { candidateId, jobId, context } = req.body;
        const organizationId = (req as any).user.organizationId as string;

        const candidate = await Candidate.findOne({ _id: candidateId, organization: organizationId });
        if (!candidate) {
            return res.status(404).json({ success: false, message: 'Candidate not found' });
        }

        // jobId is optional: if missing or invalid, still generate a generic suggestion
        let job: any = null;
        if (jobId) {
            job = await Job.findOne({ _id: jobId, organization: organizationId });
        }

        const jobRequirements = job?.description || 'General recruitment outreach for a suitable open role.';
        const suggestion = await communicationService.suggestResponse(
            candidate.toObject(),
            jobRequirements,
            context || 'Initial outreach after matching'
        );

        res.status(200).json({
            success: true,
            data: suggestion || ''
        });
    } catch (error: any) {
        console.error('getAISuggestion error:', error);
        // Never fail hard for UX – return empty suggestion
        res.status(200).json({ success: true, data: '' });
    }
};
