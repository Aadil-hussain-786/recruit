import { Request, Response } from 'express';
import { schedulingService } from '../services/schedulingService';
import { interviewService } from '../services/interviewService';
import Candidate from '../models/Candidate';

// @desc    Create scheduling link for application
// @route   POST /api/interviews/schedule-link
// @access  Private
export const createScheduleLink = async (req: Request, res: Response) => {
    try {
        const { applicationId } = req.body;
        const organizationId = (req as any).user.organizationId as string;

        const link = await schedulingService.createSchedulingLink(applicationId, organizationId);

        res.status(200).json({
            success: true,
            data: { link }
        });
    } catch (error: any) {
        console.error('Error in createScheduleLink:', error);
        res.status(500).json({ success: false, message: 'Error creating scheduling link' });
    }
};

// @desc    Get available slots
// @route   GET /api/interviews/slots/:interviewerId
// @access  Public (Candidate access)
export const getAvailableSlots = async (req: Request, res: Response) => {
    try {
        const slots = await schedulingService.getAvailableSlots(req.params.interviewerId as string);
        res.status(200).json({
            success: true,
            data: slots
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: 'Error fetching slots' });
    }
};

// @desc    Confirm interview (Candidate action)
// @route   POST /api/interviews/confirm
// @access  Public
export const confirmInterview = async (req: Request, res: Response) => {
    try {
        const { applicationId, interviewerId, slot, organizationId } = req.body;
        const interview = await schedulingService.confirmInterview(applicationId, interviewerId, new Date(slot), organizationId);

        res.status(201).json({
            success: true,
            data: interview
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: 'Error confirming interview' });
    }
};
// @desc    Download candidate transcript as .txt
// @route   GET /api/interviews/transcript/:candidateId
// @access  Private
export const downloadCandidateTranscript = async (req: Request, res: Response) => {
    try {
        const candidate = await Candidate.findById(req.params.candidateId);
        if (!candidate) {
            return res.status(404).json({ success: false, message: 'Candidate not found' });
        }

        const transcript = interviewService.formatScriptToTranscript(candidate);
        
        // Final prompt said stored in .txt format
        res.setHeader('Content-Type', 'text/plain');
        res.setHeader('Content-Disposition', `attachment; filename=transcript_${candidate.firstName}_${candidate.lastName}.txt`);
        
        return res.send(transcript);
    } catch (error: any) {
        console.error('Error in downloadCandidateTranscript:', error);
        res.status(500).json({ success: false, message: 'Error exporting transcript' });
    }
};
