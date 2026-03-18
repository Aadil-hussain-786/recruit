import { Request, Response } from 'express';
import { assessmentService } from '../services/assessmentService';
import Candidate from '../models/Candidate';

// @desc    Generate assessment quiz for a job
// @route   POST /api/assessments/generate
// @access  Private
export const generateAssessment = async (req: Request, res: Response) => {
    try {
        const { role, skills, difficulty, experienceLevel } = req.body;

        if (!role || !skills || !Array.isArray(skills)) {
            return res.status(400).json({ success: false, message: 'Please provide role and skills array' });
        }

        const quiz = await assessmentService.generateQuiz(role, skills, difficulty, experienceLevel);

        res.status(200).json({
            success: true,
            data: quiz
        });
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error generating assessment', error: error.message });
    }
};

// @desc    Submit and grade assessment
// @route   POST /api/assessments/submit
// @access  Public (Candidate access)
export const submitAssessment = async (req: Request, res: Response) => {
    try {
        const { candidateId, jobId, questions, answers } = req.body;

        if (!candidateId || !jobId || !questions || !answers) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }

        // Grade with the new comprehensive system (now async for open-ended AI grading)
        const gradingResult = await assessmentService.gradeAssessment(questions, answers);

        // Store full result in candidate profile
        await Candidate.findByIdAndUpdate(candidateId, {
            $set: {
                [`assessments.${jobId}`]: {
                    score: gradingResult.score,
                    dimensionBreakdown: gradingResult.dimensionBreakdown,
                    skillBreakdown: gradingResult.skillBreakdown,
                    completedAt: new Date()
                }
            }
        });

        res.status(200).json({
            success: true,
            data: gradingResult
        });
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error submitting assessment', error: error.message });
    }
};

// @desc    Get assessment results for a candidate
// @route   GET /api/assessments/results/:candidateId/:jobId
// @access  Private
export const getAssessmentResults = async (req: Request, res: Response) => {
    try {
        const { candidateId, jobId } = req.params;
        const organizationId = (req as any).user.organizationId as string;

        const candidate = await Candidate.findOne({
            _id: candidateId,
            organization: organizationId
        });

        if (!candidate) {
            return res.status(404).json({ success: false, message: 'Candidate not found' });
        }

        const assessmentResult = (candidate as any).assessments?.get?.(jobId) || (candidate as any).assessments?.[jobId as string];

        if (!assessmentResult) {
            return res.status(404).json({ success: false, message: 'No assessment found for this job' });
        }

        res.status(200).json({
            success: true,
            data: assessmentResult
        });
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error fetching results' });
    }
};
