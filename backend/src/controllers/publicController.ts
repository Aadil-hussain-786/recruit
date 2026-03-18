import { Request, Response } from 'express';
import Job from '../models/Job';
import Candidate from '../models/Candidate';
import Application from '../models/Application';
import { aiService } from '../services/aiService';
import mongoose from 'mongoose';

export const getPublicJob = async (req: Request, res: Response) => {
    try {
        const job = await Job.findById(req.params.id)
            .select('title description department location status organization');

        if (!job || job.status === 'draft') {
            return res.status(404).json({ success: false, message: 'Job not found' });
        }

        res.status(200).json({
            success: true,
            data: job
        });
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

export const applyToJob = async (req: Request, res: Response) => {
    try {
        const jobId = req.params.id;
        const job = await Job.findById(jobId);

        if (!job) {
            return res.status(404).json({ success: false, message: 'Job not found' });
        }

        const { firstName, lastName, email, phone, currentCompany, currentTitle, skills, expectedSalary, noticePeriod } = req.body;
        const locationInput = req.body.location;

        if (!firstName || !lastName || !email) {
            console.error('[ApplyToJob] Validation Error: Missing required fields', { firstName: !!firstName, lastName: !!lastName, email: !!email });
            return res.status(400).json({ success: false, message: 'Missing required fields: First Name, Last Name, and Email are required.' });
        }

        // Check if candidate already exists
        let candidate = await Candidate.findOne({ email, organization: job.organization });

        let resumeData: any = {};
        if ((req as any).file) {
            try {
                const text = await aiService.extractText((req as any).file.buffer, (req as any).file.mimetype);
                resumeData = await aiService.parseResume(text);
                console.log(`[ApplyToJob] Resume parsed successfully for ${email}`);
            } catch (resumeError: any) {
                console.error('[ApplyToJob] Resume analysis failed:', resumeError.message);
                // We continue anyway, the application is more important than the analysis
            }
        }

        const skillsArray = Array.isArray(skills) 
            ? skills 
            : (typeof skills === 'string' ? skills.split(',').map((s: string) => s.trim()).filter(Boolean) : []);
        
        const profileText = `${firstName} ${lastName} ${skillsArray.join(' ')} ${currentTitle || ''}`;

        let embedding: number[] = [];
        try {
            embedding = await aiService.generateEmbeddings(profileText);
        } catch (embeddingError) {
            console.warn('[ApplyToJob] Embedding generation skipped:', (embeddingError as Error).message);
        }

        // Properly structure location
        let locationObj = { city: '', country: '' };
        if (typeof locationInput === 'string' && locationInput) {
            locationObj.city = locationInput;
        } else if (typeof locationInput === 'object' && locationInput) {
            locationObj = { ...locationObj, ...locationInput };
        } else if (resumeData.location) {
            locationObj = { ...locationObj, ...resumeData.location };
        }

        if (candidate) {
            // Update existing candidate
            console.log(`[ApplyToJob] Updating existing candidate: ${email}`);
            candidate.firstName = firstName;
            candidate.lastName = lastName;
            candidate.phone = phone || candidate.phone;
            candidate.skills = skillsArray.length > 0 ? skillsArray : candidate.skills;
            candidate.embedding = embedding.length > 0 ? embedding : candidate.embedding;
            candidate.currentCompany = currentCompany || candidate.currentCompany;
            candidate.currentTitle = currentTitle || candidate.currentTitle;
            candidate.location = locationObj.city || locationObj.country ? locationObj : candidate.location;
            
            // Merge resume analysis patterns if available
            if (resumeData.patterns) {
                candidate.patterns = { ...candidate.patterns, ...resumeData.patterns };
            }
            if (Object.keys(resumeData).length > 0) {
                candidate.parsedData = { ...candidate.parsedData, ...resumeData };
            }
            
            await candidate.save();
        } else {
            // Create new candidate
            console.log(`[ApplyToJob] Creating new candidate: ${email}`);
            candidate = await Candidate.create({
                firstName,
                lastName,
                email,
                phone,
                currentCompany,
                currentTitle,
                skills: skillsArray,
                location: locationObj,
                expectedSalary: expectedSalary || 0,
                noticePeriod,
                organization: job.organization,
                embedding,
                patterns: resumeData.patterns || {},
                parsedData: resumeData,
                source: 'Public Job Board',
                createdBy: job.postedBy || job.organization, // Fallback to organization ID if postedBy is missing
            });
        }

        // Create application
        console.log(`[ApplyToJob] Creating application for candidate ${candidate._id} and job ${jobId}`);
        const application = await Application.create({
            job: new mongoose.Types.ObjectId(jobId as string),
            candidate: (candidate as any)._id,
            organization: (job as any).organization,
            source: 'Public Job Board',
            stage: 'applied',
            status: 'active',
            appliedDate: new Date(),
        });

        console.log(`[ApplyToJob] Success: Application ${application._id} created`);
        res.status(201).json({
            success: true,
            data: {
                applicationId: application._id,
                candidateId: candidate._id
            },
            message: 'Application submitted successfully! Our AI is now reviewing your profile.'
        });
    } catch (error: any) {
        console.error('[ApplyToJob] Fatal Error:', error);
        
        // Handle Mongoose validation errors specifically
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map((err: any) => err.message);
            return res.status(400).json({ success: false, message: `Validation Error: ${messages.join(', ')}` });
        }

        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: 'You have already applied for this job.' });
        }

        res.status(500).json({ 
            success: false, 
            message: 'An error occurred while submitting your application.', 
            error: error.message 
        });
    }
};

export const onboardPulseCandidate = async (req: Request, res: Response) => {
    try {
        const { jobId, firstName, lastName, currentTitle, currentCompany, socialUrl, skills } = req.body;

        if (!jobId || !firstName || !lastName) {
            return res.status(400).json({ success: false, message: 'Invalid pulse session data' });
        }

        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(404).json({ success: false, message: 'Job not found' });
        }

        // Generate a placeholder email if not provided (social candidates often won't have it yet)
        const email = req.body.email || `${firstName.toLowerCase()}.${lastName.toLowerCase()}@pulse.social`;

        // Check if candidate exists by socialUrl or email
        let candidate = await Candidate.findOne({ 
            $or: [{ socialUrl }, { email }],
            organization: job.organization 
        });

        if (!candidate) {
            candidate = await Candidate.create({
                firstName,
                lastName,
                email,
                currentTitle,
                currentCompany,
                socialUrl,
                skills: Array.isArray(skills) ? skills : [],
                organization: job.organization,
                createdBy: job.postedBy || job.organization,
                source: 'Neural Pulse',
                status: 'screening'
            });
        }

        // Check for existing application
        let application = await Application.findOne({
            job: job._id,
            candidate: candidate._id
        });

        if (!application) {
            application = await Application.create({
                job: job._id,
                candidate: candidate._id,
                organization: job.organization,
                source: 'Neural Pulse',
                stage: 'screening',
                status: 'active',
                appliedDate: new Date()
            });
        }

        res.status(200).json({
            success: true,
            data: {
                applicationId: application._id,
                candidateId: candidate._id,
                job: {
                    title: job.title,
                    department: job.department
                }
            }
        });
    } catch (error: any) {
        console.error('[OnboardPulse] Error:', error);
        res.status(500).json({ success: false, message: 'Failed to initialize pulse sequence' });
    }
};

