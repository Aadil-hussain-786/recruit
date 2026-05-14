import { ICandidate } from '../models/Candidate';
import Candidate from '../models/Candidate';

export const interviewService = {
    /**
     * Convert an interview script (Q/A pairs) into a professional TXT transcript string.
     */
    formatScriptToTranscript(candidate: any): string {
        const header = `RECRUIT-AI // INTERVIEW TRANSCRIPT\n` +
                       `Candidate: ${candidate.firstName} ${candidate.lastName}\n` +
                       `Date: ${new Date().toLocaleDateString()}\n` +
                       `Status: AI-Generated Simulation\n` +
                       `--------------------------------------------------\n\n`;

        const questions = candidate.interviewQuestions || [];
        const content = questions.map((q: any, i: number) => {
            return `[RECRUITER] Q${i + 1}: ${q.question}\n` +
                   `[IDEAL_RESPONSE]: ${q.idealAnswer}\n\n`;
        }).join('');

        const footer = `--------------------------------------------------\n` +
                       `End of Transcript protocol.`;

        return header + content + footer;
    },

    /**
     * Add a transcript to a candidate profile
     */
    async saveTranscript(candidateId: string, content: string, type: 'AI_SIMULATION' | 'REAL_INTERVIEW' = 'REAL_INTERVIEW') {
        const candidate = await Candidate.findById(candidateId);
        if (!candidate) throw new Error('Candidate not found');

        if (!candidate.transcripts) {
            candidate.transcripts = [];
        }

        candidate.transcripts.push({
            content,
            date: new Date(),
            type
        });

        await candidate.save();
        return candidate;
    }
};
