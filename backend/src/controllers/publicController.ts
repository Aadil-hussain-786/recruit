import { Request, Response } from 'express';
import Job from '../models/Job';
import Candidate from '../models/Candidate';
import Application from '../models/Application';
import { aiService } from '../services/aiService';
import { emailService } from '../services/emailService';
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

export const requestEarlyAccess = async (req: Request, res: Response) => {
    try {
        const { name, email, company, message } = req.body;

        if (!name || !email) {
            return res.status(400).json({ success: false, message: 'Name and Email are required.' });
        }

        const adminEmail = 'recruitaicorp@gmail.com';
        const subject = `🚀 New Early Access Request: ${name}`;
        
        const html = `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; border: 1px solid #f1f5f9; border-radius: 24px; background-color: #ffffff; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);">
                <div style="margin-bottom: 32px; border-bottom: 2px solid #0ea5e9; padding-bottom: 16px;">
                    <h1 style="color: #0f172a; margin: 0; font-size: 24px; font-weight: 800; text-transform: uppercase; letter-spacing: -0.025em;">Recruit <span style="color: #0ea5e9;">// AI</span></h1>
                    <p style="color: #64748b; margin-top: 4px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em;">Neural Talent Protocol</p>
                </div>
                
                <h2 style="color: #0f172a; font-size: 20px; font-weight: 800; margin-bottom: 24px;">New Protocol Request Detected</h2>
                
                <div style="background-color: #f8fafc; border-radius: 16px; padding: 24px; margin-bottom: 32px;">
                    <div style="margin-bottom: 16px;">
                        <p style="color: #64748b; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; margin: 0 0 4px 0;">Requester Name</p>
                        <p style="color: #0f172a; font-size: 16px; font-weight: 600; margin: 0;">${name}</p>
                    </div>
                    
                    <div style="margin-bottom: 16px;">
                        <p style="color: #64748b; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; margin: 0 0 4px 0;">Email Address</p>
                        <p style="color: #0f172a; font-size: 16px; font-weight: 600; margin: 0;">${email}</p>
                    </div>
                    
                    ${company ? `
                    <div style="margin-bottom: 16px;">
                        <p style="color: #64748b; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; margin: 0 0 4px 0;">Organization</p>
                        <p style="color: #0f172a; font-size: 16px; font-weight: 600; margin: 0;">${company}</p>
                    </div>
                    ` : ''}
                    
                    ${message ? `
                    <div>
                        <p style="color: #64748b; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; margin: 0 0 4px 0;">Request Context</p>
                        <p style="color: #0f172a; font-size: 14px; line-height: 1.6; margin: 0;">${message}</p>
                    </div>
                    ` : ''}
                </div>
                
                <div style="text-align: center; margin-bottom: 32px;">
                    <a href="mailto:${email}?subject=Welcome%20to%20Recruit-AI%20Waitlist" style="display: inline-block; background-color: #0f172a; color: #ffffff; padding: 16px 32px; border-radius: 12px; font-weight: 800; text-decoration: none; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em;">Acknowledge Requester</a>
                </div>
                
                <hr style="border: 0; border-top: 1px solid #f1f5f9; margin-bottom: 24px;" />
                
                <div style="text-align: center;">
                    <p style="color: #94a3b8; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin: 0;">System_v1.1.0_Engine // Neural_Core_Node_7</p>
                </div>
            </div>
        `;

        await emailService.sendEmail(adminEmail, subject, html);
        
        // Also send a thank you email to the user
        const thankYouSubject = `Welcome to Recruit-AI Neural Protocol`;
        const thankYouHtml = `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; border: 1px solid #f1f5f9; border-radius: 24px; background-color: #ffffff;">
                <div style="margin-bottom: 32px; border-bottom: 2px solid #0ea5e9; padding-bottom: 16px;">
                    <h1 style="color: #0f172a; margin: 0; font-size: 24px; font-weight: 800; text-transform: uppercase; letter-spacing: -0.025em;">Recruit <span style="color: #0ea5e9;">// AI</span></h1>
                </div>
                
                <h2 style="color: #0f172a; font-size: 20px; font-weight: 800; margin-bottom: 24px;">Hello ${name},</h2>
                
                <p style="color: #475569; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
                    We've successfully registered your request for early access to the <strong>Recruit-AI Neural Talent Protocol</strong>.
                </p>
                
                <p style="color: #475569; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
                    Our engine is currently in architecture calibration, merging decentralized talent streams into our autonomous layer. Your position in the node queue has been secured.
                </p>
                
                <div style="background-color: #f0f9ff; border: 1px solid #e0f2fe; border-radius: 12px; padding: 20px; margin-bottom: 32px;">
                    <p style="color: #0369a1; font-size: 14px; font-weight: 700; margin: 0;">Status: NEURAL_WAITLIST_SYNCED</p>
                </div>
                
                <p style="color: #64748b; font-size: 14px; line-height: 1.6;">
                    We will notify you once your neural clearance has been approved.
                </p>
                
                <div style="margin-top: 40px; border-top: 1px solid #f1f5f9; padding-top: 24px; text-align: center;">
                    <p style="color: #94a3b8; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; margin: 0;">Automated by Recruit Engineering Works</p>
                </div>
            </div>
        `;
        
        await emailService.sendEmail(email, thankYouSubject, thankYouHtml);

        res.status(200).json({ 
            success: true, 
            message: 'Early access request submitted successfully. Check your email for confirmation.' 
        });
    } catch (error: any) {
        console.error('[EarlyAccess] Error:', error);
        res.status(500).json({ success: false, message: 'Failed to process request. Please try again later.' });
    }
};

