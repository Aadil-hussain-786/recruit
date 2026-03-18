import express from 'express';
import { sendCandidateEmail, getAISuggestion } from '../controllers/communicationController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.use(protect);

router.post('/email', sendCandidateEmail);
router.post('/suggest', getAISuggestion);

export default router;
