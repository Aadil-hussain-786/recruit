import { Request, Response } from 'express';
import Application from '../models/Application';
import Job from '../models/Job';

// @desc    Get all applications for the organization
// @route   GET /api/applications
// @access  Private
export const getApplications = async (req: Request, res: Response) => {
    try {
        const organizationId = (req as any).user.organizationId;

        const applications = await Application.find({ organization: organizationId })
            .populate('job')
            .populate('candidate')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: applications.length,
            data: applications
        });
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Apply for a job
// @route   POST /api/applications
// @access  Private (usually Public, but for internal tracking we use Private for now)
export const createApplication = async (req: Request, res: Response) => {
    try {
        const organizationId = (req as any).user.organizationId;
        const { jobId, candidateId, stage } = req.body;

        // Ensure job exists and belongs to org
        const job = await Job.findOne({ _id: jobId, organization: organizationId });

        if (!job) {
            return res.status(404).json({ success: false, message: 'Job not found or unauthorized' });
        }

        const application = await Application.create({
            job: jobId,
            candidate: candidateId,
            stage: stage || 'applied',
            organization: organizationId,
        });

        res.status(201).json({
            success: true,
            data: application
        });
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update application stage (Kanban Drag & Drop)
// @route   PUT /api/applications/:id/stage
// @access  Private
export const updateApplicationStage = async (req: Request, res: Response) => {
    try {
        const organizationId = (req as any).user.organizationId;
        const { stage } = req.body;

        const application = await Application.findOne({
            _id: req.params.id,
            organization: organizationId
        });

        if (!application) {
            return res.status(404).json({ success: false, message: 'Application not found or unauthorized' });
        }

        const updatedApplication = await Application.findByIdAndUpdate(
            req.params.id,
            { stage },
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            data: updatedApplication
        });
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
