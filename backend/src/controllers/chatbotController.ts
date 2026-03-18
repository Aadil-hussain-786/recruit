import { Request, Response } from 'express';
import { chatbotService } from '../services/chatbotService';
import Candidate from '../models/Candidate';
import Application from '../models/Application';
import { emailService } from '../services/emailService';

// @desc    Get chatbot response
// @route   POST /api/chatbot/message
// @access  Public (Candidate access)
export const getChatbotResponse = async (req: Request, res: Response) => {
    try {
        const { message, history, candidateId, applicationId, context: reqContext } = req.body;

        if (!message) {
            return res.status(400).json({ success: false, message: 'Message is required' });
        }

        const context = {
            candidateId,
            applicationId,
            timestamp: new Date().toISOString(),
            ...(reqContext || {})
        };

        // Check FAQ first (skipped during interviews)
        const faqAnswer = chatbotService.getFAQ(message, context);
        if (faqAnswer) {
            return res.status(200).json({
                success: true,
                data: { response: faqAnswer, source: 'faq', shouldEscalate: false }
            });
        }

        // Check if should escalate
        const shouldEscalate = chatbotService.shouldEscalate(message);
        if (shouldEscalate) {
            return res.status(200).json({
                success: true,
                data: {
                    response: "I understand this is important. I've notified our recruitment team and someone will reach out within 24 hours.",
                    source: 'escalation',
                    shouldEscalate: true
                }
            });
        }

        const aiResponse = await chatbotService.generateResponse(message, context, history);

        res.status(200).json({
            success: true,
            data: { response: aiResponse, source: 'ai', shouldEscalate: false }
        });
    } catch (error: any) {
        console.error('Chatbot controller error:', error?.message || error);

        if (error?.message === 'EXPIRED_API_KEY' || error?.message === 'MISSING_API_KEY') {
            return res.status(200).json({
                success: true,
                data: {
                    response: "I'm having trouble connecting to my neural network. Please update your OPENROUTER_API_KEY in the backend/.env file.",
                    source: 'fallback', shouldEscalate: false
                }
            });
        }

        if (error?.message === 'QUOTA_EXCEEDED') {
            return res.status(200).json({
                success: true,
                data: {
                    response: "Neural bandwidth exceeded. Please wait a moment before your next entry.",
                    source: 'fallback', shouldEscalate: false
                }
            });
        }

        res.status(200).json({
            success: true,
            data: {
                response: "I'm having trouble connecting right now. Please try again in 30 seconds or refresh.",
                source: 'fallback', shouldEscalate: false
            }
        });
    }
};

/**
 * Smart merge: takes the HIGHER of existing vs new score.
 * Previous bug: averaged with 0 on first run, halving real scores.
 * Now: if one side is 0 (uninitialized), uses the other side entirely.
 * If both have data, takes the higher value (interview results should improve, not regress).
 */
function smartMergeScore(existing: number | undefined, incoming: number | undefined): number {
    const a = existing || 0;
    const b = incoming || 0;
    if (a === 0) return b;
    if (b === 0) return a;
    // Both have values: use weighted average favoring the newer (incoming) data
    return Math.round(a * 0.3 + b * 0.7);
}

// @desc    Complete interview and analyze patterns
// @route   POST /api/chatbot/complete-interview
// @access  Public
export const completeInterview = async (req: Request, res: Response) => {
    try {
        const { candidateId, transcript, rawQA } = req.body;

        if (!candidateId || !transcript) {
            return res.status(400).json({ success: false, message: 'Candidate ID and transcript are required' });
        }

        const analysis = await chatbotService.analyzeInterview(transcript);

        // Use real-time captured Q&A pairs if available; otherwise use AI-extracted
        const interviewScript = (Array.isArray(rawQA) && rawQA.length > 0)
            ? rawQA
            : (analysis.interviewScript || []);

        if (analysis) {
            // Resolve candidateId
            let targetCandidateId = candidateId;
            const isValidId = /^[0-9a-fA-F]{24}$/.test(candidateId || '');

            if (!isValidId && req.body.applicationId) {
                const isValidAppId = /^[0-9a-fA-F]{24}$/.test(req.body.applicationId);
                if (isValidAppId) {
                    try {
                        const application = await Application.findById(req.body.applicationId);
                        if (application && application.candidate) {
                            targetCandidateId = application.candidate.toString();
                        }
                    } catch (e) {
                        console.error('[DB Update] Failed to derive candidate from application:', e);
                    }
                }
            }

            const finalValidId = /^[0-9a-fA-F]{24}$/.test(targetCandidateId || '');

            if (finalValidId) {
                try {
                    const candidate = await Candidate.findById(targetCandidateId);
                    if (candidate) {
                        // Initialize patterns if needed
                        if (!candidate.patterns) {
                            candidate.patterns = {
                                technicalAptitude: 0, leadershipPotential: 0,
                                culturalAlignment: 0, creativity: 0, confidence: 0,
                                communicationSkill: 0, problemSolvingAbility: 0,
                                adaptability: 0, domainExpertise: 0,
                                teamworkOrientation: 0, selfAwareness: 0, growthMindset: 0,
                                notes: [],
                                biasAnalysis: { score: 100, findings: [], suggestions: [] },
                                interviewScript: []
                            };
                        }

                        // Smart merge — no more averaging with zeros
                        candidate.patterns = {
                            // Primary metrics
                            technicalAptitude: smartMergeScore(candidate.patterns.technicalAptitude, analysis.technicalAptitude),
                            leadershipPotential: smartMergeScore(candidate.patterns.leadershipPotential, analysis.leadershipPotential),
                            culturalAlignment: smartMergeScore(candidate.patterns.culturalAlignment, analysis.culturalAlignment),
                            creativity: smartMergeScore(candidate.patterns.creativity, analysis.creativity),
                            confidence: smartMergeScore(candidate.patterns.confidence, analysis.confidence),
                            // Extended metrics
                            communicationSkill: smartMergeScore(candidate.patterns.communicationSkill, analysis.communicationSkill),
                            problemSolvingAbility: smartMergeScore(candidate.patterns.problemSolvingAbility, analysis.problemSolvingAbility),
                            adaptability: smartMergeScore(candidate.patterns.adaptability, analysis.adaptability),
                            domainExpertise: smartMergeScore(candidate.patterns.domainExpertise, analysis.domainExpertise),
                            teamworkOrientation: smartMergeScore(candidate.patterns.teamworkOrientation, analysis.teamworkOrientation),
                            selfAwareness: smartMergeScore(candidate.patterns.selfAwareness, analysis.selfAwareness),
                            growthMindset: smartMergeScore(candidate.patterns.growthMindset, analysis.growthMindset),
                            // Qualitative (append notes, replace others with latest)
                            notes: [...(Array.isArray(candidate.patterns.notes) ? candidate.patterns.notes : []), analysis.summary].filter(Boolean),
                            strengthsAndWeaknesses: analysis.strengthsAndWeaknesses || candidate.patterns.strengthsAndWeaknesses,
                            hireRecommendation: analysis.hireRecommendation || candidate.patterns.hireRecommendation,
                            biasAnalysis: analysis.biasAnalysis || candidate.patterns.biasAnalysis,
                            interviewScript: interviewScript,
                            hiddenBriefing: candidate.patterns.hiddenBriefing // preserve existing
                        };
                        await candidate.save();
                    }
                } catch (dbError: any) {
                    console.error('[DB Update] Pattern merge failed:', dbError.message);
                }
            } else {
                console.warn('[DB Update] Invalid candidateId format:', candidateId);
            }
        }

        analysis.interviewScript = interviewScript;

        res.status(200).json({
            success: true,
            data: analysis,
            message: 'Interview analysis completed'
        });
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error analyzing interview', error: error.message });
    }
};

// @desc    Generate a unique interview link for a discovered candidate (from PDF/Scraper)
// @route   POST /api/chatbot/generate-invite
// @access  Private (Recruiter)
export const generateInterviewInvite = async (req: Request, res: Response) => {
    try {
        const { fullName, profileLink, role, email } = req.body;

        if (!fullName) {
            return res.status(400).json({ success: false, message: 'Candidate name is required' });
        }

        // Create a placeholder candidate record so they have an ID for the system
        // In a real app, you might check for duplicates by profileLink first
        const candidate = await Candidate.create({
            firstName: fullName.split(' ')[0],
            lastName: fullName.split(' ').slice(1).join(' ') || '',
            email: email, // Save email if provided
            socialLinks: { linkedin: profileLink },
            currentTitle: role,
            source: 'Talent Discovery Report',
            status: 'invited'
        } as any);

        // Generate the link that points to the frontend interview page
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        const inviteLink = `${frontendUrl}/interview/start?candId=${candidate._id}`;

        res.status(200).json({
            success: true,
            data: { inviteLink, candidateId: candidate._id },
            message: 'Invite link generated successfully'
        });
    } catch (error: any) {
        console.error('Error generating invite:', error);
        res.status(500).json({ success: false, message: 'Failed to generate invite', error: error.message });
    }
};

// @desc    Bulk invite multiple candidates found via Discovery
// @route   POST /api/chatbot/bulk-invite
// @access  Private
export const bulkInviteCandidates = async (req: Request, res: Response) => {
    try {
        const { candidates, jobTitle } = req.body;

        if (!Array.isArray(candidates) || candidates.length === 0) {
            return res.status(400).json({ success: false, message: 'No candidates provided for bulk invite' });
        }

        const results = {
            total: candidates.length,
            sent: 0,
            failed: 0,
            skipped: 0,
            errors: [] as string[]
        };

        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        const targetRole = jobTitle || 'Engineering Role';

        // Process candidates sequentially to maintain stable DB connection
        for (const c of candidates) {
            // Skip if no email found (cannot invite)
            if (!c.email) {
                results.skipped++;
                continue;
            }

            try {
                // 1. Find or Create Candidate
                let candidate = await Candidate.findOne({ email: c.email });

                if (!candidate) {
                    candidate = await Candidate.create({
                        firstName: c.fullName?.split(' ')[0] || c.firstName || 'Candidate',
                        lastName: c.fullName?.split(' ').slice(1).join(' ') || c.lastName || '',
                        email: c.email,
                        socialLinks: {
                            linkedin: c.profileLink || c.socialUrl,
                            portfolio: c.portfolioUrl || c.socialLinks?.portfolio
                        },
                        currentTitle: c.role || c.currentTitle || targetRole,
                        source: 'Bulk Discovery Invite',
                        status: 'invited'
                    } as any);
                }

                // 2. Generate Link
                const inviteLink = `${frontendUrl}/interview/start?candId=${candidate._id}`;

                // 3. Send Email
                const emailResult = await emailService.sendInterviewInvite(
                    `${candidate.firstName} ${candidate.lastName}`,
                    candidate.email as string,
                    targetRole,
                    inviteLink
                );

                if (emailResult && !('error' in emailResult)) {
                    results.sent++;
                } else {
                    results.failed++;
                    results.errors.push(`Email failed for ${candidate.email}`);
                }

            } catch (err: any) {
                results.failed++;
                results.errors.push(`Error processing ${c.email}: ${err.message}`);
            }
        }

        res.status(200).json({
            success: true,
            message: `Bulk operation complete. Sent: ${results.sent}, Failed: ${results.failed}`,
            data: results
        });

    } catch (error: any) {
        console.error('Bulk invite error:', error);
        res.status(500).json({ success: false, message: 'Bulk processing failed', error: error.message });
    }
};
