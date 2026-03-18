import express from 'express';
import { getPublicJob, applyToJob, onboardPulseCandidate } from '../controllers/publicController';
import multer from 'multer';

const router = express.Router();
const upload = multer();

router.get('/jobs/:id', getPublicJob);
router.post('/jobs/:id/apply', upload.single('resume'), applyToJob);
router.post('/pulse/onboard', onboardPulseCandidate);

export default router;
