import express from 'express';
import {
    getJobs,
    createJob,
    getJob,
    updateJob,
    deleteJob,
    getStats,
    generateAIJD,
    matchCandidates,
    publishJobToExternal
} from '../controllers/jobController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.use(protect); // All job routes are protected

router.get('/', getJobs);
router.post('/', createJob);
router.get('/stats', getStats);
router.post('/generate-jd', generateAIJD);
router.get('/:id/match', matchCandidates);
router.post('/:id/publish', publishJobToExternal);
router.get('/:id', getJob);
router.put('/:id', updateJob);
router.delete('/:id', deleteJob);

export default router;
