import { ICandidate } from './models/Candidate'; // Adjusted import path for backend/src/services

export interface EthicalCV {
    header: {
        name: string;
        contact: string;
        role: string;
    };
    psychometrics: {
        aptitude: number;
        leadership: number;
        confidence: number;
        gapAnalysis: string; // The delta between confidence and aptitude
    };
    analysis: {
        archetype: string;
        strengths: string[];
        blindSpots: string[];
        ethicalFlag: string | null; // e.g., "Misrepresentation of skills"
    };
}

export const candidateProfileService = {
    /**
     * Generates an 'Ethical CV' that contrasts claimed skills with analyzed patterns.
     */
    generateEthicalCV(candidate: ICandidate): EthicalCV {
        const patterns = candidate.patterns || {
            technicalAptitude: 0,
            leadershipPotential: 0,
            confidence: 0,
            notes: [],
            strengthsAndWeaknesses: { strengths: [], blindSpots: [], weaknesses: [] }
        };

        // Determine the "Reality Gap"
        const confidence = patterns.confidence || 0;
        const aptitude = patterns.technicalAptitude || 0;
        let gapAnalysis = "Balanced profile";

        if (confidence > aptitude + 30) {
            gapAnalysis = "High Confidence / Low Evidence (Potential Dunning-Kruger)";
        } else if (aptitude > confidence + 20) {
            gapAnalysis = "High Aptitude / Low Confidence (Imposter Syndrome)";
        }

        // Extract Archetype from notes if available, handle potential missing notes array
        const notes = Array.isArray(patterns.notes) ? patterns.notes : [];
        const archetypeNote = notes.find(n => n.includes("Archetype")) || "Unclassified";
        const archetype = archetypeNote.split("'")[1] || "Standard Candidate";

        const contactInfo = [
            candidate.phone,
            candidate.email,
            candidate.socialLinks?.portfolio
        ].filter(Boolean).join(' | ') || 'Not Provided';

        return {
            header: {
                name: `${candidate.firstName} ${candidate.lastName}`,
                contact: contactInfo,
                role: candidate.currentTitle || "Applicant"
            },
            psychometrics: {
                aptitude: patterns.technicalAptitude || 0,
                leadership: patterns.leadershipPotential || 0,
                confidence: patterns.confidence || 0,
                gapAnalysis
            },
            analysis: {
                archetype: archetype,
                strengths: patterns.strengthsAndWeaknesses?.strengths || [],
                blindSpots: patterns.strengthsAndWeaknesses?.blindSpots || [],
                ethicalFlag: gapAnalysis.includes("High Confidence") ? "Verify technical claims deeply" : null
            }
        };
    },

    /**
     * Formats the Ethical CV as a readable text report
     */
    formatReport(cv: EthicalCV): string {
        return `
ETHICAL CV REPORT: ${cv.header.name}
------------------------------------------------
CONTACT: ${cv.header.contact}
ROLE:    ${cv.header.role}

PSYCHOMETRIC PROFILE
------------------------------------------------
Technical Aptitude: ${cv.psychometrics.aptitude}/100
Confidence:         ${cv.psychometrics.confidence}/100
Leadership:         ${cv.psychometrics.leadership}/100
REALITY GAP:        ${cv.psychometrics.gapAnalysis}

INTELLIGENCE ANALYSIS
------------------------------------------------
Archetype:   ${cv.analysis.archetype}
Blind Spots: ${cv.analysis.blindSpots.join(', ') || 'None detected'}
Flags:       ${cv.analysis.ethicalFlag || 'None'}
`;
    }
};