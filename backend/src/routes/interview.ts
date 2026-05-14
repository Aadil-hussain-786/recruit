import express from 'express';
import { createScheduleLink, getAvailableSlots, confirmInterview, downloadCandidateTranscript } from '../controllers/interviewController';
import { protect } from '../middleware/auth';

const router = express.Router();

// Make schedule-link accessible ONLY with auth because it needs organizationId from req.user
router.post('/schedule-link', protect, createScheduleLink);
router.get('/slots/:interviewerId', getAvailableSlots);
router.post('/confirm', confirmInterview);
router.get('/transcript/:candidateId', protect, downloadCandidateTranscript);

export default router;
