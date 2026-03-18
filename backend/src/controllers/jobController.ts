import { Request, Response } from 'express';
import Job from '../models/Job';
import Candidate from '../models/Candidate';
import { aiService } from '../services/aiService';
import { matchingService } from '../services/matchingService';
import { jobBoardService } from '../services/jobBoardService';

// @desc    Publish job to external boards
// @route   POST /api/jobs/:id/publish
// @access  Private
export const publishJobToExternal = async (req: Request, res: Response) => {
    try {
        const organizationId = (req as any).user.organizationId as string;
        const jobId = req.params.id as string;

        // Verify job exists and belongs to organization
        const job = await Job.findOne({ _id: jobId, organization: organizationId });

        if (!job) {
            return res.status(404).json({ success: false, message: 'Job not found' });
        }

        const results = await jobBoardService.publishToExternalBoards(jobId, organizationId);

        // Update status to 'published' if successful
        const anySuccess = results && Array.isArray(results) && results.some((r: any) => r.success);
        if (anySuccess) {
            job.status = 'published';
            await job.save();
        }

        res.status(200).json({
            success: true,
            data: results
        });
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Publishing error', error: error.message });
    }
};

// @desc    Generate JD using AI
// @route   POST /api/jobs/generate-jd
// @access  Private
export const generateAIJD = async (req: Request, res: Response) => {
    try {
        const { role, seniority, keySkills, tone } = req.body;

        if (!role || !seniority || !keySkills || !Array.isArray(keySkills)) {
            return res.status(400).json({ success: false, message: 'Please provide role, seniority, and key skills (as an array)' });
        }

        const jd = await aiService.generateJD(role, seniority, keySkills, tone);

        res.status(200).json({
            success: true,
            data: jd
        });
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error generating JD', error: error.message });
    }
};

// @desc    Match candidates for a job
// @route   GET /api/jobs/:id/match
// @access  Private
export const matchCandidates = async (req: Request, res: Response) => {
    try {
        const organizationId = (req as any).user.organizationId as string;
        const jobId = req.params.id as string;

        // Get the job
        const job = await Job.findOne({ _id: jobId, organization: organizationId });

        if (!job) {
            return res.status(404).json({ success: false, message: 'Job not found' });
        }

        // Get all candidates for the organization
        const candidates = await Candidate.find({ organization: organizationId });

        if (candidates.length === 0) {
            return res.status(200).json({ success: true, data: [], biasAnalysis: null });
        }

        // Step 1: Initial ranking — uses vector similarity if embeddings are valid,
        // otherwise clean keyword/skills overlap (never random fallback)
        const jobForRanking = {
            title: job.title,
            description: job.description,
            embedding: job.embedding as number[] | undefined
        };

        const rankedCandidates = matchingService.rankCandidates(
            jobForRanking,
            candidates.map(c => c.toObject())
        );

        let results = matchingService.diversifyRecommendations(rankedCandidates);

        // Step 2: Deep qualitative refinement for top candidates
        // (all candidates now have at least a score of 10 floor from keywordScore)
        const TOP_N = 5;
        const topWithScore = results.filter((c: any) => c.matchScore > 5).slice(0, TOP_N);

        for (let i = 0; i < topWithScore.length; i++) {
            const candidate = topWithScore[i];

            try {
                const deepAnalysis = await matchingService.deepQualitativeMatch(
                    { title: job.title, description: job.description },
                    candidate
                );

                // Weighted blend: 60% AI qualitative score, 40% initial keyword/vector score
                // This gives AI more authority while keeping keyword as a guard against hallucinations
                const refinedScore = Math.round((deepAnalysis.score * 0.6) + (candidate.matchScore * 0.4));

                topWithScore[i] = {
                    ...candidate,
                    matchScore: refinedScore,
                    reasoning: deepAnalysis.reasoning,
                    isDeepAnalyzed: true
                };
            } catch (deepErr) {
                // If AI fails for one candidate, keep their keyword score, don't crash
                console.error(`[matchCandidates] Deep analysis failed for ${candidate._id}:`, deepErr);
            }
        }

        // Merge back: deep-analyzed top N + remaining candidates, re-sorted
        const topIds = new Set(topWithScore.map((c: any) => String(c._id)));
        const remainingResults = results.filter((c: any) => !topIds.has(String(c._id)));
        results = [...topWithScore, ...remainingResults].sort((a, b) => b.matchScore - a.matchScore);

        // Step 3: Optional bias analysis on the #1 match
        let biasAnalysis = null;
        if (results.length > 0) {
            try {
                const top = results[0];
                const profileSummary = `${top.firstName ?? ''} ${top.lastName ?? ''}\n${top.currentTitle ?? ''}\n${(top.skills ?? []).join(', ')}`;
                biasAnalysis = await aiService.detectBias(profileSummary);
            } catch { /* non-fatal */ }
        }

        res.status(200).json({
            success: true,
            data: results,
            biasAnalysis
        });
    } catch (error: any) {
        console.error('[matchCandidates] Error:', error);
        res.status(500).json({ success: false, message: 'Matching error', error: error.message });
    }
};


// @desc    Get all jobs for the organization
// @route   GET /api/jobs
// @access  Private
export const getJobs = async (req: Request, res: Response) => {
    try {
        const organizationId = (req as any).user.organizationId as string;

        const jobs = await Job.find({ organization: organizationId }).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: jobs.length,
            data: jobs
        });
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Create new job
// @route   POST /api/jobs
// @access  Private
export const createJob = async (req: Request, res: Response) => {
    try {
        const organizationId = (req as any).user.organizationId as string;
        const userId = (req as any).user._id as string;
        const { title, description, status, department, location } = req.body;

        // Validate required fields
        if (!title || !description) {
            return res.status(400).json({
                success: false,
                message: 'Title and description are required'
            });
        }

        // Generate embedding for the job description
        let embedding: number[] = [];
        try {
            embedding = await aiService.generateEmbeddings(`${title}\n${description}`);
        } catch (embeddingError: any) {
            console.error('Embedding generation error:', embeddingError);
            // Non-fatal error for job creation, but log it
        }

        const job = await Job.create({
            title,
            description,
            department: department || 'Not Specified',
            location: location || 'Remote',
            status: status || 'draft',
            organization: organizationId,
            postedBy: userId,
            embedding,
        });

        res.status(201).json({
            success: true,
            data: job
        });
    } catch (error: any) {
        console.error('Job creation error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create job',
            error: error.message
        });
    }
};

// @desc    Get single job
// @route   GET /api/jobs/:id
// @access  Private
export const getJob = async (req: Request, res: Response) => {
    try {
        const organizationId = (req as any).user.organizationId as string;
        const job = await Job.findOne({
            _id: req.params.id,
            organization: organizationId,
        });

        if (!job) {
            return res.status(404).json({ success: false, message: 'Job not found' });
        }

        res.status(200).json({
            success: true,
            data: job
        });
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Update job
// @route   PUT /api/jobs/:id
// @access  Private
export const updateJob = async (req: Request, res: Response) => {
    try {
        const organizationId = (req as any).user.organizationId as string;
        const { title, description, status } = req.body;

        // Ensure job belongs to org
        const job = await Job.findOne({
            _id: req.params.id,
            organization: organizationId,
        });

        if (!job) {
            return res.status(404).json({ success: false, message: 'Job not found or unauthorized' });
        }

        // Regenerate embedding if title or description changed
        const titleChanged = title && title !== job.title;
        const descriptionChanged = description && description !== job.description;

        if (titleChanged || descriptionChanged) {
            try {
                const combinedText = `${title || job.title}\n${description || job.description}`;
                req.body.embedding = await aiService.generateEmbeddings(combinedText);
            } catch (embeddingError: any) {
                console.error('Embedding generation error during update:', embeddingError);
            }
        }

        // Prevent illegal field updates
        const updateData = { ...req.body };
        delete updateData._id;
        delete updateData.organization;
        delete updateData.postedBy;

        const updatedJob = await Job.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            data: updatedJob
        });
    } catch (error: any) {
        console.error('Job update error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update job',
            error: error.message
        });
    }
};

// @desc    Delete job
// @route   DELETE /api/jobs/:id
// @access  Private
export const deleteJob = async (req: Request, res: Response) => {
    try {
        const organizationId = (req as any).user.organizationId as string;

        const job = await Job.findOne({
            _id: req.params.id,
            organization: organizationId,
        });

        if (!job) {
            return res.status(404).json({ success: false, message: 'Job not found or unauthorized' });
        }

        await Job.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Get dashboard statistics
// @route   GET /api/jobs/stats
// @access  Private
export const getStats = async (req: Request, res: Response) => {
    try {
        const organizationId = (req as any).user.organizationId as string;

        const totalJobs = await Job.countDocuments({ organization: organizationId });
        const activeJobs = await Job.countDocuments({ organization: organizationId, status: { $in: ['active', 'published'] } });
        const draftJobs = await Job.countDocuments({ organization: organizationId, status: 'draft' });

        // Get candidates count
        const totalCandidates = await Candidate.countDocuments({ organization: organizationId });

        // Get latest neural insights (candidates with interview notes)
        const recentInsights = await Candidate.find({
            organization: organizationId,
            'patterns.notes': { $exists: true, $not: { $size: 0 } }
        })
            .sort({ updatedAt: -1 })
            .limit(3)
            .select('firstName lastName patterns.notes updatedAt');

        const formattedInsights = recentInsights.map(c => ({
            candidateName: `${c.firstName} ${c.lastName}`,
            summary: c.patterns?.notes?.[c.patterns.notes.length - 1] || "No summary available",
            date: c.updatedAt
        }));

        res.status(200).json({
            success: true,
            data: {
                totalJobs,
                activeJobs,
                draftJobs,
                totalCandidates,
                interviewPassRate: "82%",
                timeToHire: "12 days",
                recentInsights: formattedInsights
            }
        });
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
