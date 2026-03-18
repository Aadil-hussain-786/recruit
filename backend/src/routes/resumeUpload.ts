import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { ResumeUploadService, resumeUploadService as sharedService } from '../services/resumeUpload/resumeUploadService';
import { protect } from '../middleware/auth';
import { resumeUploadRateLimiter } from '../middleware/rateLimiter';

const router = Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

function getService(): ResumeUploadService {
  return sharedService;
}

/**
 * POST /api/v1/resumes/upload
 * Upload a single resume
 */
router.post(
  '/upload',
  protect,
  resumeUploadRateLimiter.middleware(),
  upload.single('resume'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const file = req.file;
      
      if (!file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }

      const jobDescriptionId = req.body.jobDescriptionId as string | undefined;
      const userId = (req as any).user?._id || (req as any).user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
      }

      const service = getService();
      const result = await service.uploadResume(
        file.buffer,
        file.originalname,
        userId,
        jobDescriptionId
      );

      if (!result.success) {
        return res.status(400).json({
          success: false,
          error: result.error
        });
      }

      return res.status(201).json({
        success: true,
        data: {
          resumeId: result.resumeId,
          sessionId: result.sessionId,
          fileName: file.originalname,
          fileSize: file.size
        }
      });
    } catch (error: any) {
      next(error);
    }
  }
);

/**
 * POST /api/v1/resumes/batch
 * Upload multiple resumes
 */
router.post(
  '/batch',
  protect,
  resumeUploadRateLimiter.middleware(),
  upload.array('resumes', 20), // Max 20 files
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const files = req.files as Express.Multer.File[];
      
      if (!files || files.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No files uploaded'
        });
      }

      const jobDescriptionId = req.body.jobDescriptionId as string | undefined;
      const userId = (req as any).user?._id || (req as any).user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
      }

      const service = getService();
      const result = await service.uploadMultipleResumes(
        files.map(f => ({ buffer: f.buffer, fileName: f.originalname })),
        userId,
        jobDescriptionId
      );

      return res.status(201).json({
        success: true,
        data: {
          sessionId: result.sessionId,
          total: result.total,
          successful: result.successful,
          failed: result.failed,
          results: result.results
        }
      });
    } catch (error: any) {
      next(error);
    }
  }
);

/**
 * GET /api/v1/resumes/:resumeId
 * Get resume metadata
 */
router.get(
  '/:resumeId',
  protect,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const resumeId = Array.isArray(req.params.resumeId) ? req.params.resumeId[0] : req.params.resumeId;
      const userId = (req as any).user?._id || (req as any).user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
      }

      const service = getService();
      const resume = await service.getResumeById(resumeId);

      if (!resume) {
        return res.status(404).json({
          success: false,
          message: 'Resume not found'
        });
      }

      // Verify ownership
      if (resume.userId !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to access this resume'
        });
      }

      return res.status(200).json({
        success: true,
        data: resume
      });
    } catch (error: any) {
      next(error);
    }
  }
);

/**
 * GET /api/v1/resumes/:resumeId/result
 * Get processing result for a resume
 */
router.get(
  '/:resumeId/result',
  protect,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const resumeId = Array.isArray(req.params.resumeId) ? req.params.resumeId[0] : req.params.resumeId;
      const userId = (req as any).user?._id || (req as any).user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
      }

      const service = getService();
      
      // First check resume ownership
      const resume = await service.getResumeById(resumeId);
      
      if (!resume) {
        return res.status(404).json({
          success: false,
          message: 'Resume not found'
        });
      }

      // Normalize user IDs to strings for comparison (fixes ObjectId vs string mismatch)
      const storedUserId = String(resume.userId);
      const requestUserId = String(userId);
      
      if (storedUserId !== requestUserId) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to access this resume'
        });
      }

      const result = await service.getProcessingResult(resumeId);

      if (!result) {
        return res.status(202).json({
          success: true,
          message: 'Processing still in progress',
          data: {
            resumeId,
            status: 'processing'
          }
        });
      }

      return res.status(200).json({
        success: true,
        data: result
      });
    } catch (error: any) {
      next(error);
    }
  }
);

/**
 * DELETE /api/v1/resumes/:resumeId
 * Cancel/delete a resume upload
 */
router.delete(
  '/:resumeId',
  protect,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const resumeId = Array.isArray(req.params.resumeId) ? req.params.resumeId[0] : req.params.resumeId;
      const userId = (req as any).user?._id || (req as any).user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
      }

      const service = getService();
      
      // First check resume ownership
      const resume = await service.getResumeById(resumeId);
      
      if (!resume) {
        return res.status(404).json({
          success: false,
          message: 'Resume not found'
        });
      }

      // Normalize user IDs to strings for comparison (fixes ObjectId vs string mismatch)
      const storedUserId = String(resume.userId);
      const requestUserId = String(userId);
      
      if (storedUserId !== requestUserId) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to delete this resume'
        });
      }

      const cancelled = await service.cancelUpload(resumeId);

      if (!cancelled) {
        return res.status(400).json({
          success: false,
          message: 'Cannot cancel resume that is currently processing'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Resume cancelled successfully'
      });
    } catch (error: any) {
      next(error);
    }
  }
);

/**
 * GET /api/v1/resumes/stats
 * Get service statistics
 */
router.get(
  '/stats',
  protect,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const service = getService();
      const stats = service.getStats();

      return res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error: any) {
      next(error);
    }
  }
);

export default router;