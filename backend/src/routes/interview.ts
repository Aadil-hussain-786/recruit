import express from 'express';
import { createScheduleLink, getAvailableSlots, confirmInterview } from '../controllers/interviewController';
import { protect } from '../middleware/auth';

const router = express.Router();

// Make schedule-link accessible ONLY with auth because it needs organizationId from req.user
router.post('/schedule-link', protect, createScheduleLink);
router.get('/slots/:interviewerId', getAvailableSlots);
router.post('/confirm', confirmInterview);

export default router;
