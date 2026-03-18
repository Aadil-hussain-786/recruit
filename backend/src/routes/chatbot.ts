import express from 'express';
import { getChatbotResponse, completeInterview } from '../controllers/chatbotController';

const router = express.Router();

router.post('/message', getChatbotResponse);
router.post('/complete-interview', completeInterview);

export default router;
