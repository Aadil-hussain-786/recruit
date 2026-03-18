import express from 'express';
import { getApplications, createApplication, updateApplicationStage } from '../controllers/applicationController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.use(protect);

router.get('/', getApplications);
router.post('/', createApplication);
router.put('/:id/stage', updateApplicationStage);

export default router;
