import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import * as dotenv from 'dotenv';

// Load env vars
dotenv.config({ override: true });

const app: Application = express();

import authRoutes from './routes/auth';
import jobRoutes from './routes/job';
import candidateRoutes from './routes/candidate';
import applicationRoutes from './routes/application';
import communicationRoutes from './routes/communication';
import interviewRoutes from './routes/interview';
import assessmentRoutes from './routes/assessment';
import chatbotRoutes from './routes/chatbot';
import publicRoutes from './routes/public';
import resumeUploadRoutes from './routes/resumeUpload';
import analysisRoutes from './routes/analysis';
import aiRoutes from './routes/ai';

// Middleware
app.use(cors({
    origin: (origin: string | undefined, callback: any) => {
      // Allow local development and frontend production URLs
      const allowedOrigins = [
        'http://localhost:3000',
        'http://localhost:3001',
        process.env.FRONTEND_URL,
      ].filter(Boolean);
      
      if (!origin || allowedOrigins.some(ao => origin.startsWith(ao as string)) || origin.endsWith('.vercel.app')) {
        callback(null, true);
      } else {
        callback(null, true); // Allow all for now during transition, or restrict more if needed
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
});

app.use(
    helmet({
        crossOriginResourcePolicy: { policy: "cross-origin" },
        contentSecurityPolicy: false,
    })
);

// Request logging middleware for debugging
app.use((req, res, next) => {
    console.log(`>>> ${req.method} ${req.path}`);
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`<<< ${req.method} ${req.path} [${res.statusCode}] - ${duration}ms`);
    });
    next();
});

app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/candidates', candidateRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/communication', communicationRoutes);
app.use('/api/interviews', interviewRoutes);
app.use('/api/assessments', assessmentRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/v1/resumes', resumeUploadRoutes);
app.use('/api/analysis', analysisRoutes);
app.use('/api/ai', aiRoutes);

// Health Check Route
app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({ status: 'ok', message: 'Recruitment AI Backend is running' });
});

// Root Route
app.get('/', (req: Request, res: Response) => {
    res.status(200).send('Recruitment AI Backend is running. API is available at /api');
});

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: err.message || 'Server Error',
    });
});

export default app;
