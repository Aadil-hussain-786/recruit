import { ICandidate } from '../models/Candidate';

export interface EthicalCV {
    header: {
        name: string;
        contact: string;
        role: string;
        source: string;
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
        reasoning?: string; // Added for external candidates
    };
}

export const candidateProfileService = {
    /**
     * Generates an 'Ethical CV' that contrasts claimed skills with analyzed patterns.
     */
    generateEthicalCV(candidate: ICandidate | any): EthicalCV {
        // Handle both DB candidates and external discovery objects
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

        // Extract Archetype from notes if available
        const notes = Array.isArray(patterns.notes) ? patterns.notes : [];
        const archetypeNote = notes.find((n: string) => n.includes("Archetype")) || "Unclassified";
        const archetype = archetypeNote.split("'")[1] || (candidate.matchScore ? `External Match (${candidate.matchScore}%)` : "Standard Candidate");

        return {
            header: {
                name: `${candidate.firstName} ${candidate.lastName}`,
                contact: candidate.phone || candidate.email || "Not Provided",
                role: candidate.currentTitle || "Applicant",
                source: candidate.source || 'Internal Database'
            },
            psychometrics: {
                aptitude: patterns.technicalAptitude || 0,
                leadership: patterns.leadershipPotential || 0,
                confidence: patterns.confidence || 0,
                gapAnalysis
            },
            analysis: {
                archetype: archetype,
                strengths: patterns.strengthsAndWeaknesses?.strengths || candidate.skills || [],
                blindSpots: patterns.strengthsAndWeaknesses?.blindSpots || [],
                ethicalFlag: gapAnalysis.includes("High Confidence") ? "Verify technical claims deeply" : null,
                reasoning: candidate.reasoning || patterns.notes?.[0] || ''
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
ROLE:    ${cv.header.role} (${cv.header.source})

PSYCHOMETRIC PROFILE SUMMARY
------------------------------------------------
Technical Aptitude: ${cv.psychometrics.aptitude}/100
Confidence:         ${cv.psychometrics.confidence}/100
Leadership:         ${cv.psychometrics.leadership}/100
REALITY GAP:        ${cv.psychometrics.gapAnalysis}

INTELLIGENCE ANALYSIS
------------------------------------------------
Archetype:   ${cv.analysis.archetype}
Blind Spots: ${cv.analysis.blindSpots.join(', ') || 'None detected'}
Reasoning:   ${cv.analysis.reasoning || 'N/A'}
Flags:       ${cv.analysis.ethicalFlag || 'None'}
`;
    }
};