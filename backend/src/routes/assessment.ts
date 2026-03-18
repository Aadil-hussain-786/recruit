import express from 'express';
import { generateAssessment, submitAssessment, getAssessmentResults } from '../controllers/assessmentController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.post('/generate', protect, generateAssessment);
router.post('/submit', submitAssessment); // Public for candidate access
router.get('/results/:candidateId/:jobId', protect, getAssessmentResults);

export default router;
