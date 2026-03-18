import { Request, Response } from 'express';
import { aiService } from '../services/aiService';
import Candidate from '../models/Candidate';
import { analyticsService } from '../services/analyticsService';
import { realtimeService } from '../services/realtimeService';
import { emailService } from '../services/emailService';
import { schedulingIntegrationService } from '../services/schedulingIntegrationService';
import Job from '../models/Job';

// @desc    Parse resume file using AI
// @route   POST /api/candidates/parse-resume
// @access  Private
export const parseResume = async (req: Request, res: Response) => {
    const startTime = Date.now();
    const fileName = (req as any).file?.originalname || 'unknown';
    const fileSize = (req as any).file?.size || 0;
    const fileMimetype = (req as any).file?.mimetype || 'unknown';

    console.log(`[parseResume] Starting resume parsing for file: ${fileName}`);
    console.log(`[parseResume] File size: ${fileSize} bytes, type: ${fileMimetype}`);

    try {
        if (!(req as any).file) {
            console.error(`[parseResume] Error: No file uploaded - Missing file in request`);
            return res.status(400).json({ success: false, message: 'Please upload a file' });
        }

        // Explicit file type validation (backup check)
        const allowedTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ];
        if (!allowedTypes.includes((req as any).file.mimetype)) {
            console.error(`[parseResume] Error: Invalid file type - ${fileMimetype} not in allowed types`, {
                allowedTypes,
                fileName,
                fileSize
            });
            return res.status(400).json({ success: false, message: 'Invalid file type. Only PDF and DOCX files are allowed.' });
        }

        // Explicit file size validation (5MB limit)
        const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes
        if ((req as any).file.size > MAX_FILE_SIZE) {
            console.error(`[parseResume] Error: File size exceeds limit - ${fileSize} bytes > ${MAX_FILE_SIZE} bytes`, {
                fileName,
                fileSize,
                maxSize: MAX_FILE_SIZE
            });
            return res.status(400).json({ success: false, message: 'File size exceeds 5MB limit' });
        }

        console.log(`[parseResume] Text extraction started`);
        const extractionStart = Date.now();
        const text = await aiService.extractText((req as any).file.buffer, (req as any).file.mimetype);
        const extractionDuration = Date.now() - extractionStart;
        console.log(`[parseResume] Text extraction completed in ${extractionDuration}ms`);

        const language = (req.body.language as string) || 'en-US';
        console.log(`[parseResume] Resume parsing started for language: ${language}`);
        const parseStart = Date.now();
        const parsedData = await aiService.parseResume(text, language);
        const parseDuration = Date.now() - parseStart;
        console.log(`[parseResume] Resume parsing completed in ${parseDuration}ms`);

        const totalDuration = Date.now() - startTime;
        console.log(`[parseResume] Total processing time: ${totalDuration}ms`);

        res.status(200).json({
            success: true,
            data: parsedData
        });
    } catch (error: any) {
        const totalDuration = Date.now() - startTime;
        console.error(`[parseResume] Error: ${error.message} - Resume parsing failed after ${totalDuration}ms`, {
            fileName,
            fileSize,
            fileMimetype,
            errorStack: error.stack,
            errorType: error.constructor.name
        });
        res.status(500).json({ success: false, message: 'Error parsing resume', error: error.message });
    }
};

// @desc    Get all candidates for the organization
// @route   GET /api/candidates
// @access  Private
export const getCandidates = async (req: Request, res: Response) => {
    try {
        const candidates = await Candidate.find({ organization: (req as any).user.organizationId });
        res.status(200).json({
            success: true,
            count: candidates.length,
            data: candidates
        });
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error fetching candidates', error: error.message });
    }
};

// @desc    Create a new candidate
// @route   POST /api/candidates
// @access  Private
export const createCandidate = async (req: Request, res: Response) => {
    console.log('[createCandidate] Request received:', req.body);
    try {
        const candidate = await Candidate.create({
            ...req.body,
            organization: (req as any).user.organizationId
        });

        // High-impact push: Track and Log
        analyticsService.capture((req as any).user.id, 'candidate_created', { candidateId: candidate._id });
        realtimeService.logActivity((req as any).user.organizationId, 'Candidate Indexed', `${candidate.firstName} ${candidate.lastName} was added to the pool.`);

        res.status(201).json({ success: true, data: candidate });
    } catch (error: any) {
        console.error('[createCandidate] Error:', error);
        console.error('[createCandidate] Request body:', req.body);
        res.status(500).json({ success: false, message: 'Error creating candidate', error: error.message });
    }
};

// @desc    Get single candidate
// @route   GET /api/candidates/:id
// @access  Private
export const getCandidate = async (req: Request, res: Response) => {
    try {
        const candidate = await Candidate.findById(req.params.id);
        if (!candidate) {
            return res.status(404).json({ success: false, message: 'Candidate not found' });
        }
        res.status(200).json({ success: true, data: candidate });
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error fetching candidate', error: error.message });
    }
};

// @desc    Update candidate
// @route   PUT /api/candidates/:id
// @access  Private
export const updateCandidate = async (req: Request, res: Response) => {
    try {
        let candidate = await Candidate.findById(req.params.id);
        if (!candidate) {
            return res.status(404).json({ success: false, message: 'Candidate not found' });
        }
        candidate = await Candidate.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        // High-impact push: Automation Trigger
        if (req.body.status === 'screening' && candidate) {
            const bookingUrl = await schedulingIntegrationService.createBookingLink(
                (req as any).user.email,
                candidate.email,
                'interview'
            );
            
            await emailService.sendInterviewInvite(
                candidate.firstName,
                candidate.email,
                'Candidate Screening',
                bookingUrl
            );
            
            realtimeService.logActivity((req as any).user.organizationId, 'Invite Sent', `Screening invitation dispatched to ${candidate.firstName}`);
        }

        res.status(200).json({ success: true, data: candidate });
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error updating candidate', error: error.message });
    }
};

// @desc    Delete candidate
// @route   DELETE /api/candidates/:id
// @access  Private
export const deleteCandidate = async (req: Request, res: Response) => {
    try {
        const candidate = await Candidate.findById(req.params.id);
        if (!candidate) {
            return res.status(404).json({ success: false, message: 'Candidate not found' });
        }
        await candidate.deleteOne();
        res.status(200).json({ success: true, data: {} });
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error deleting candidate', error: error.message });
    }
};

function smartMergeScore(existing: number | undefined, incoming: number | undefined): number {
    if (existing === undefined) return incoming || 0;
    if (incoming === undefined) return existing;
    return Math.max(existing, incoming);
}

// @desc    Fetch resume from URL
// @route   POST /api/candidates/fetch-resume
// @access  Private
export const resumeFetcher = async (req: Request, res: Response) => {
    try {
        const { url } = req.body;
        if (!url) {
            return res.status(400).json({ success: false, message: 'URL is required' });
        }

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch resume: ${response.statusText}`);
        }

        const buffer = await response.arrayBuffer();
        const mimeType = response.headers.get('content-type') || 'application/pdf';

        // Validate file type
        const allowedTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ];
        if (!allowedTypes.includes(mimeType)) {
            return res.status(400).json({ success: false, message: 'Invalid file type. Only PDF and DOCX files are allowed.' });
        }

        // Validate file size
        const MAX_FILE_SIZE = 5 * 1024 * 1024;
        if (buffer.byteLength > MAX_FILE_SIZE) {
            return res.status(400).json({ success: false, message: 'File size exceeds 5MB limit' });
        }

        const text = await aiService.extractText(Buffer.from(buffer), mimeType);
        const language = (req.body.language as string) || 'en-US';
        const parsedData = await aiService.parseResume(text, language);

        res.status(200).json({
            success: true,
            data: parsedData
        });
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error fetching resume', error: error.message });
    }
};
