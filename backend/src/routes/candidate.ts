import express from 'express';
import {
    getCandidates,
    createCandidate,
    getCandidate,
    updateCandidate,
    deleteCandidate,
    parseResume,
    resumeFetcher
} from '../controllers/candidateController';
import { protect } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = express.Router();

router.use(protect);

router.post('/parse-resume', upload.single('resume'), parseResume);
router.post('/fetcher', resumeFetcher);
router.get('/', getCandidates);
router.post('/', createCandidate);
router.get('/:id', getCandidate);
router.put('/:id', updateCandidate);
router.delete('/:id', deleteCandidate);

export default router;
