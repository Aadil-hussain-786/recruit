import express from 'express';
import { getPublicJob, applyToJob, onboardPulseCandidate, requestEarlyAccess } from '../controllers/publicController';
import multer from 'multer';

const router = express.Router();
const upload = multer();

router.get('/jobs/:id', getPublicJob);
router.post('/jobs/:id/apply', upload.single('resume'), applyToJob);
router.post('/pulse/onboard', onboardPulseCandidate);
router.post('/early-access', requestEarlyAccess);

export default router;
