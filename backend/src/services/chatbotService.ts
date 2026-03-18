import { callOpenRouter } from './aiWrapper';

// Interview phase definitions for structured intelligence extraction
const INTERVIEW_PHASES = {
    intro: {
        name: 'Introduction & Rapport',
        questionCount: 2,
        focus: 'background, motivation, career goals',
        style: 'warm but observant'
    },
    technical_depth: {
        name: 'Technical Deep Dive',
        questionCount: 4,
        focus: 'architecture decisions, debugging approach, system design, code quality philosophy',
        style: 'challenging, follow-up on claims'
    },
    problem_solving: {
        name: 'Problem Solving & Analytical Thinking',
        questionCount: 3,
        focus: 'approach to ambiguous problems, breaking down complexity, trade-off analysis',
        style: 'present scenarios, ask for step-by-step reasoning'
    },
    behavioral: {
        name: 'Behavioral & Leadership',
        questionCount: 3,
        focus: 'conflict resolution, teamwork, failure stories, mentorship, handling pressure',
        style: 'STAR method probing, look for specific examples not hypotheticals'
    },
    communication: {
        name: 'Communication & Adaptability',
        questionCount: 2,
        focus: 'explaining complex concepts simply, adapting to change, learning new tech',
        style: 'ask them to explain a concept to a non-technical person'
    },
    closing: {
        name: 'Closing & Culture Fit',
        questionCount: 1,
        focus: 'what they value in a team, ideal work environment, red flags they watch for',
        style: 'conversational, genuine curiosity'
    }
};

export const chatbotService = {
    /**
     * Generate AI interview response with structured phase awareness
     */
    async generateResponse(userMessage: string, context: any = {}, history: any[] = []): Promise<string> {
        const isInterview = context?.type === 'interview';
        const language = process.env.INTERVIEW_LANGUAGE || 'English';

        // Calculate current phase based on message count
        const userMessageCount = history.filter(m => m.role === 'user').length + 1;
        const currentPhase = this.determinePhase(userMessageCount);

        const systemPrompt = isInterview
            ? `You are NEURAL RECRUITER V4, an elite AI interviewer specialized in extracting deep candidate intelligence across multiple dimensions.

YOUR MISSION: Conduct a structured, multi-phase interview that reveals the complete intelligence profile of the candidate.

CURRENT PHASE: ${currentPhase.name}
PHASE FOCUS: ${currentPhase.focus}
INTERVIEW STYLE: ${currentPhase.style}
QUESTION ${userMessageCount} of ~15

CORE OPERATING DIRECTIVES:
1. STRUCTURED PROBING: You are in the "${currentPhase.name}" phase. Focus your questions on: ${currentPhase.focus}
2. DEPTH OVER BREADTH: Ask ONE focused question. Then FOLLOW UP on their answer to go deeper.
3. EVIDENCE HUNTING: Always ask for SPECIFIC examples, numbers, outcomes. "Tell me about a time..." is better than "How would you..."
4. CONTRADICTION DETECTION: If their answer conflicts with something they said earlier, probe it directly but diplomatically.
5. SKILL VERIFICATION: Don't accept buzzwords. If they say "expert in X", ask them to explain a specific advanced concept in X.
6. BEHAVIORAL SIGNALS: Note their communication style — are they structured or scattered? Confident or evasive? Specific or vague?
7. ADAPTIVE DIFFICULTY: If they answer well, push harder. If they struggle, offer a gentler version but note the struggle.
8. CONTEXTUAL MEMORY: Reference their previous answers precisely. "You mentioned working at [company] — how did that shape your approach to [topic]?"

QUESTION TYPES TO USE (vary based on phase):
- TECHNICAL: "Walk me through how you would design..." / "What happens under the hood when..."
- SCENARIO: "You discover the production database is corrupted during peak hours. Walk me through your exact steps."
- BEHAVIORAL: "Tell me about a specific time when you had to convince your team to change direction."
- COMMUNICATION: "Explain [complex concept] as if I'm a product manager who doesn't code."
- PROBLEM-SOLVING: "Here's a constraint: [X]. How would you still achieve [Y]?"
- SELF-AWARENESS: "What's the biggest technical mistake you've made, and what did you learn?"

RESPONSE RULES:
- Under 3 sentences for transitions
- Under 5 sentences for follow-ups
- NO filler ("That's interesting", "I see", "Great answer")
- Start directly with your next question or follow-up
- If they give a weak answer, acknowledge it briefly and redirect

Language: ${language}`
            : `You are RecruitAI Intelligence. Provide high-density, accurate assistance regarding recruitment workflows in ${language}.`;

        try {
            const messages = [
                { role: 'system', content: systemPrompt },
                ...history,
                { role: 'user', content: userMessage }
            ];

            return await callOpenRouter(messages);
        } catch (error: any) {
            console.error('Chatbot service error:', error.message);
            throw error;
        }
    },

    /**
     * Determine the current interview phase based on question count
     */
    determinePhase(questionNumber: number): { name: string; focus: string; style: string } {
        if (questionNumber <= 2) return INTERVIEW_PHASES.intro;
        if (questionNumber <= 6) return INTERVIEW_PHASES.technical_depth;
        if (questionNumber <= 9) return INTERVIEW_PHASES.problem_solving;
        if (questionNumber <= 12) return INTERVIEW_PHASES.behavioral;
        if (questionNumber <= 14) return INTERVIEW_PHASES.communication;
        return INTERVIEW_PHASES.closing;
    },

    /**
     * Determine if query should be escalated to human recruiter
     */
    shouldEscalate(userMessage: string): boolean {
        const escalationKeywords = ['speak to recruiter', 'talk to human', 'urgent', 'legal'];
        return escalationKeywords.some(keyword => userMessage.toLowerCase().includes(keyword));
    },

    /**
     * FAQ automation
     */
    getFAQ(question: string, context?: any): string | null {
        if (context?.type === 'interview') return null;
        const faqs: any = {
            'application status': 'Check your dashboard for real-time updates.',
            'interview process': 'Typical flow: Screening -> Technical -> Team -> Final.',
        };
        for (const [key, value] of Object.entries(faqs)) {
            if (question.toLowerCase().includes(key)) return value as string;
        }
        return null;
    },

    /**
     * Comprehensive interview analysis — extracts 12+ intelligence dimensions
     */
    async analyzeInterview(transcript: string): Promise<any> {
        // Validate transcript length
        const cleanTranscript = transcript.replace(/ASSISTANT:.*?\n/g, '').trim();
        const wordCount = cleanTranscript.split(/\s+/).length;

        if (wordCount < 10 || transcript.length < 150) {
            return {
                status: 'insufficient_data',
                technicalAptitude: 0,
                leadershipPotential: 0,
                culturalAlignment: 0,
                creativity: 0,
                confidence: 0,
                communicationSkill: 0,
                problemSolvingAbility: 0,
                adaptability: 0,
                domainExpertise: 0,
                teamworkOrientation: 0,
                selfAwareness: 0,
                growthMindset: 0,
                summary: "Interview session too short for meaningful analysis. The candidate provided limited responses.",
                strengthsAndWeaknesses: { strengths: [], weaknesses: [], blindSpots: [] },
                hireRecommendation: { decision: 'insufficient_data', confidence: 0, reasoning: 'Too little data to assess.' },
                biasAnalysis: { score: 100, findings: ["N/A - Insufficient data"], suggestions: [] },
                interviewScript: []
            };
        }

        const prompt = `You are a senior talent intelligence analyst. Perform a COMPREHENSIVE multi-dimensional analysis of the following interview transcript.

SCORING FRAMEWORK (0-100 each, based on EVIDENCE in the transcript):

PRIMARY METRICS:
1. technicalAptitude: Score 90+ ONLY if they demonstrated architectural thinking, trade-off analysis, and specific implementation details. Score below 30 if answers were vague or buzzword-heavy.
2. leadershipPotential: Look for "we" vs "I" patterns, mentorship signals, initiative-taking, decision ownership. Below 30 if they only follow directions.
3. culturalAlignment: Do they optimize for team velocity over personal glory? Do they value quality? How do they handle disagreement?
4. creativity: How do they handle "what if" and ambiguity? Do they propose novel solutions or rely on standard patterns?
5. confidence: Distinguish "humble expertise" (good) from "vague arrogance" (bad). Score based on how well they back up claims.

EXTENDED METRICS:
6. communicationSkill: Clarity, structure, ability to explain complex ideas simply. Score their articulation quality.
7. problemSolvingAbility: How they break down problems, consider edge cases, think through trade-offs.
8. adaptability: How they respond to unexpected questions, handle topics outside their comfort zone.
9. domainExpertise: Depth of knowledge in their claimed area of expertise. Did they go beyond surface level?
10. teamworkOrientation: Evidence of collaboration, credit-sharing, empathy for colleagues.
11. selfAwareness: Do they acknowledge limitations? Can they discuss failures constructively?
12. growthMindset: Evidence of learning from mistakes, seeking feedback, continuous improvement.

QUALITATIVE ANALYSIS:
13. summary: Executive briefing starting with "Candidate exhibits [Archetype]...". Focus on the DELTA between claims and evidence. 3-4 sentences.
14. strengthsAndWeaknesses: Object with:
    - strengths: Array of 3 specific strengths with evidence quotes from the transcript
    - weaknesses: Array of 2-3 areas of concern with evidence
    - blindSpots: Array of 1-2 things the candidate doesn't seem to realize about themselves
15. hireRecommendation: Object with:
    - decision: "strong_yes" | "yes" | "maybe" | "no" | "strong_no"
    - confidence: 0-100 (how confident are you in this recommendation)
    - reasoning: 2-3 sentence justification
    - idealRole: What role would this person actually be best suited for
16. biasAnalysis: Analyze the AI's OWN questions for any leading or biased prompts.
17. interviewScript: Clean Q&A pairs extracted from transcript.

CRITICAL SCORING RULES:
- DO NOT default to 50 for any metric. Use the full 0-100 range.
- Score BELOW 30 if there's no evidence for a metric.
- Score ABOVE 80 only with strong, specific evidence.
- Range 40-60 means "some signals but inconclusive."
- EVERY score must be justified by something in the transcript.

Transcript:
${transcript}

RETURN ONLY VALID JSON. No markdown fences. No explanation outside JSON.`;

        try {
            const responseText = await callOpenRouter([
                { role: 'system', content: 'You are a senior HR psychometric analyst. Return ONLY valid JSON with no markdown formatting.' },
                { role: 'user', content: prompt }
            ], undefined, { timeout: 60000, temperature: 0.15 });

            // Robust JSON extraction
            let jsonStr = responseText.replace(/```json\n?|\n?```/gi, '').trim();
            const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                console.error('[Analysis Engine] No JSON in response:', responseText.substring(0, 500));
                throw new Error('NO_JSON_FOUND');
            }

            let analysis;
            try {
                analysis = JSON.parse(jsonMatch[0]);
            } catch (e) {
                // Try fixing common JSON issues
                let fixed = jsonMatch[0]
                    .replace(/,\s*}/g, '}')
                    .replace(/,\s*]/g, ']')
                    .replace(/'/g, '"');
                analysis = JSON.parse(fixed);
            }

            return {
                // Primary metrics
                technicalAptitude: this.clampScore(analysis.technicalAptitude),
                leadershipPotential: this.clampScore(analysis.leadershipPotential),
                culturalAlignment: this.clampScore(analysis.culturalAlignment),
                creativity: this.clampScore(analysis.creativity),
                confidence: this.clampScore(analysis.confidence),
                // Extended metrics
                communicationSkill: this.clampScore(analysis.communicationSkill),
                problemSolvingAbility: this.clampScore(analysis.problemSolvingAbility),
                adaptability: this.clampScore(analysis.adaptability),
                domainExpertise: this.clampScore(analysis.domainExpertise),
                teamworkOrientation: this.clampScore(analysis.teamworkOrientation),
                selfAwareness: this.clampScore(analysis.selfAwareness),
                growthMindset: this.clampScore(analysis.growthMindset),
                // Qualitative
                summary: analysis.summary || "Interview completed. Detailed archetype analysis pending.",
                strengthsAndWeaknesses: {
                    strengths: Array.isArray(analysis.strengthsAndWeaknesses?.strengths) ? analysis.strengthsAndWeaknesses.strengths : [],
                    weaknesses: Array.isArray(analysis.strengthsAndWeaknesses?.weaknesses) ? analysis.strengthsAndWeaknesses.weaknesses : [],
                    blindSpots: Array.isArray(analysis.strengthsAndWeaknesses?.blindSpots) ? analysis.strengthsAndWeaknesses.blindSpots : []
                },
                hireRecommendation: {
                    decision: analysis.hireRecommendation?.decision || 'maybe',
                    confidence: this.clampScore(analysis.hireRecommendation?.confidence),
                    reasoning: analysis.hireRecommendation?.reasoning || 'Requires further evaluation.',
                    idealRole: analysis.hireRecommendation?.idealRole || ''
                },
                biasAnalysis: analysis.biasAnalysis || { score: 100, findings: [], suggestions: [] },
                interviewScript: analysis.interviewScript || [],
                status: 'success'
            };
        } catch (error: any) {
            console.error('[Analysis Engine] Failed:', error.message);
            return {
                status: 'error',
                technicalAptitude: 0,
                leadershipPotential: 0,
                culturalAlignment: 0,
                creativity: 0,
                confidence: 0,
                communicationSkill: 0,
                problemSolvingAbility: 0,
                adaptability: 0,
                domainExpertise: 0,
                teamworkOrientation: 0,
                selfAwareness: 0,
                growthMindset: 0,
                summary: `Analysis engine error (${error.message || 'Network Error'}). Manual review required.`,
                strengthsAndWeaknesses: { strengths: [], weaknesses: [], blindSpots: [] },
                hireRecommendation: { decision: 'insufficient_data', confidence: 0, reasoning: 'Analysis failed.' },
                biasAnalysis: { score: 100, findings: ["Analysis failed"], suggestions: [] },
                interviewScript: []
            };
        }
    },

    /**
     * Clamp a score to 0-100, defaulting to 0 if invalid
     */
    clampScore(value: any): number {
        if (typeof value !== 'number' || isNaN(value)) return 0;
        return Math.max(0, Math.min(100, Math.round(value)));
    }
};
