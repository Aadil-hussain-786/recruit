import { Router, Request, Response, NextFunction } from 'express';
import { protect } from '../middleware/auth';
import { aiService } from '../services/aiService';

const router = Router();

/**
 * GET /api/ai/models
 * Get all available AI models
 */
router.get(
  '/models',
  protect,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const models = await aiService.getModels();
      res.status(200).json({
        success: true,
        data: models
      });
    } catch (error: any) {
      next(error);
    }
  }
);

export default router;