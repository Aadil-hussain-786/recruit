import { Router, Request, Response, NextFunction } from 'express';
import { protect } from '../middleware/auth';
import Job from '../models/Job';
import { aiService } from '../services/aiService';
import { resumeUploadService } from '../services/resumeUpload/resumeUploadService';
import { talentDiscoveryService } from '../services/talentDiscoveryService';

const router = Router();

/**
 * GET /api/analysis/jobs
 * Get all jobs for the organization
 */
router.get(
  '/jobs',
  protect,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const organizationId = (req as any).user.organizationId as string;

      const jobs = await Job.find({ organization: organizationId })
        .select('title description status createdAt')
        .sort({ createdAt: -1 });

      res.status(200).json({
        success: true,
        count: jobs.length,
        data: jobs
      });
    } catch (error: any) {
      next(error);
    }
  }
);

/**
 * POST /api/analysis/analyze
 * Analyze a resume against a job description
 */
router.post(
  '/analyze',
  protect,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      console.log('[analysis] Request received:', req.body);
      const { resumeId, jobId } = req.body;

      if (!resumeId || !jobId) {
        console.log('[analysis] Missing required fields');
        return res.status(400).json({
          success: false,
          message: 'resumeId and jobId are required'
        });
      }

      const organizationId = (req as any).user.organizationId as string;
      console.log('[analysis] Organization:', organizationId);

      // Get the job
      const job = await Job.findOne({ _id: jobId, organization: organizationId });
      console.log('[analysis] Job found:', !!job);
      if (!job) {
        return res.status(404).json({
          success: false,
          message: 'Job not found'
        });
      }

      // Get resume
      const resume = await resumeUploadService.getResumeById(resumeId);
      console.log('[analysis] Resume found:', !!resume);

      if (!resume) {
        return res.status(404).json({
          success: false,
          message: 'Resume not found'
        });
      }

      // Get processing result
      const processingResult = await resumeUploadService.getProcessingResult(resumeId);
      console.log('[analysis] Processing result:', !!processingResult);
      
      if (!processingResult) {
        return res.status(202).json({
          success: true,
          message: 'Resume is still processing',
          data: { status: 'processing' }
        });
      }

      // Get resume text content from storage
      const fullResume = await resumeUploadService.getResumeWithText(resumeId);
      const resumeText = fullResume?.textContent || '';
      console.log('[analysis] Resume text length:', resumeText.length);

      // Extract JD features
      const jdFeatures = await aiService.extractJDFeatures(job.description);
      console.log('[analysis] JD features extracted');

      // Parse resume text to candidate profile
      const candidateProfile = await aiService.parseResume(resumeText);
      console.log('[analysis] Resume parsed');

      // Compare and generate report
      const matchReport = await aiService.compareResumeToJD(candidateProfile, jdFeatures);
      console.log('[analysis] Match report generated:', !!matchReport);

      res.status(200).json({
        success: true,
        data: {
          job: {
            id: job._id,
            title: job.title
          },
          resumeId,
          ...matchReport
        }
      });
    } catch (error: any) {
      console.error('[analysis] Error:', error);
      next(error);
    }
  }
);

/**
 * POST /api/analysis/discover-talent
 * Discover talent from social platforms based on JD
 */
router.post(
  '/discover-talent',
  protect,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { jobId, modelId, lookalikeCandidate } = req.body;
      const organizationId = (req as any).user.organizationId as string;

      console.log(`[analysis/discover-talent] Request for Job: ${jobId}, Org: ${organizationId}, Model: ${modelId}`);

      if (!jobId) {
        return res.status(400).json({ success: false, message: 'jobId is required' });
      }

      const job = await Job.findOne({ _id: jobId, organization: organizationId });
      if (!job) {
        console.warn(`[analysis/discover-talent] Job not found: ${jobId}`);
        return res.status(404).json({ success: false, message: 'Job not found' });
      }

      let candidates;
      if (lookalikeCandidate) {
        console.log(`[analysis/discover-talent] Finding lookalikes for: ${lookalikeCandidate.firstName} ${lookalikeCandidate.lastName}`);
        candidates = await talentDiscoveryService.findSimilarCandidates(lookalikeCandidate, modelId);
      } else {
        console.log(`[analysis/discover-talent] Initiating discovery for: ${job.title} using model ${modelId}`);
        candidates = await talentDiscoveryService.discoverCandidates(job.description, modelId);
      }

      console.log(`[analysis/discover-talent] Discovery successful. Found ${candidates.length} candidates.`);
      res.status(200).json({
        success: true,
        count: candidates.length,
        data: candidates
      });
    } catch (error: any) {
      console.error('[analysis/discover-talent] Critical failure:', error);
      
      // If it's our specific provider error, return it gracefully
      if (error.message.includes('AI_PROVIDER_FAILURE')) {
        return res.status(503).json({
          success: false,
          message: error.message
        });
      }
      
      next(error);
    }
  }
);

export default router;