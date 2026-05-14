import mongoose, { Schema, Document } from 'mongoose';

export interface ICandidate extends Document {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    currentCompany?: string;
    currentTitle?: string;
    totalExperience?: number; // months
    skills: string[];
    resumeUrl?: string;
    linkedInUrl?: string;
    socialUrl?: string;
    source: string;
    status: 'new' | 'screening' | 'interviewing' | 'offered' | 'hired' | 'rejected';
    location?: {
        city: string;
        country: string;
    };
    expectedSalary?: number;
    salaryCurrency?: string;
    noticePeriod?: string;
    education?: {
        degree: string;
        institution: string;
        year: number;
        field: string;
    }[];
    certifications?: string[];
    languages?: string[];
    workPreference?: 'remote' | 'hybrid' | 'onsite' | 'flexible';
    isOpenToWork?: boolean;
    willingToRelocate?: boolean;
    archetype?: string;
    tenureType?: 'High Velocity' | 'Stable' | 'Legacy' | 'Unknown';
    marketCalibration?: 'Premium' | 'Aligned' | 'Value' | 'Unknown';
    interviewQuestions?: {
        question: string;
        idealAnswer: string;
    }[];
    transcripts?: {
        content: string;
        date: Date;
        type: 'AI_SIMULATION' | 'REAL_INTERVIEW';
    }[];
    parsedData?: any;
    embedding?: number[];
    patterns?: {
        // Primary metrics (0-100)
        technicalAptitude: number;
        leadershipPotential: number;
        culturalAlignment: number;
        creativity: number;
        confidence: number;
        // Extended metrics (0-100)
        communicationSkill: number;
        problemSolvingAbility: number;
        adaptability: number;
        domainExpertise: number;
        teamworkOrientation: number;
        selfAwareness: number;
        growthMindset: number;
        // Qualitative
        notes: string[];
        strengthsAndWeaknesses?: {
            strengths: string[];
            weaknesses: string[];
            blindSpots: string[];
        };
        hireRecommendation?: {
            decision: string;
            confidence: number;
            reasoning: string;
            idealRole: string;
        };
        biasAnalysis?: {
            score: number;
            findings: string[];
            suggestions: string[];
        };
        interviewScript?: {
            question: string;
            answer: string;
        }[];
        hiddenBriefing?: {
            vibe: string;
            theOneThing: string;
            probe: string;
            redFlags: string[];
        };
    };
    assessments?: Record<string, {
        score: number;
        dimensionBreakdown: any[];
        skillBreakdown: any[];
        completedAt: Date;
    }>;
    createdBy: mongoose.Types.ObjectId;
    organization: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const CandidateSchema: Schema = new Schema(
    {
        firstName: { type: String, required: true, trim: true },
        lastName: { type: String, required: true, trim: true },
        email: { type: String, required: true, trim: true, index: true },
        phone: String,
        currentCompany: String,
        currentTitle: String,
        totalExperience: Number,
        skills: [String],
        resumeUrl: String,
        linkedInUrl: String,
        socialUrl: String,
        source: String,
        status: {
            type: String,
            enum: ['new', 'screening', 'interviewing', 'offered', 'hired', 'rejected'],
            default: 'new',
        },
        location: {
            city: String,
            country: String,
        },
        expectedSalary: Number,
        salaryCurrency: { type: String, default: 'USD' },
        noticePeriod: String,
        education: [{
            degree: String,
            institution: String,
            year: Number,
            field: String
        }],
        certifications: [String],
        languages: [String],
        workPreference: {
            type: String,
            enum: ['remote', 'hybrid', 'onsite', 'flexible'],
            default: 'flexible'
        },
        isOpenToWork: { type: Boolean, default: false },
        willingToRelocate: { type: Boolean, default: false },
        archetype: { type: String, default: 'Standard' },
        tenureType: { 
            type: String, 
            enum: ['High Velocity', 'Stable', 'Legacy', 'Unknown'], 
            default: 'Unknown' 
        },
        marketCalibration: { 
            type: String, 
            enum: ['Premium', 'Aligned', 'Value', 'Unknown'], 
            default: 'Unknown' 
        },
        interviewQuestions: [{
            question: String,
            idealAnswer: String
        }],
        transcripts: [{
            content: String,
            date: { type: Date, default: Date.now },
            type: { type: String, enum: ['AI_SIMULATION', 'REAL_INTERVIEW'], default: 'REAL_INTERVIEW' }
        }],
        parsedData: Object,
        embedding: { type: [Number], default: [] },
        patterns: {
            // Primary metrics
            technicalAptitude: { type: Number, default: 0 },
            leadershipPotential: { type: Number, default: 0 },
            culturalAlignment: { type: Number, default: 0 },
            creativity: { type: Number, default: 0 },
            confidence: { type: Number, default: 0 },
            // Extended metrics
            communicationSkill: { type: Number, default: 0 },
            problemSolvingAbility: { type: Number, default: 0 },
            adaptability: { type: Number, default: 0 },
            domainExpertise: { type: Number, default: 0 },
            teamworkOrientation: { type: Number, default: 0 },
            selfAwareness: { type: Number, default: 0 },
            growthMindset: { type: Number, default: 0 },
            // Qualitative
            notes: [String],
            strengthsAndWeaknesses: {
                strengths: [String],
                weaknesses: [String],
                blindSpots: [String]
            },
            hireRecommendation: {
                decision: String,
                confidence: { type: Number, default: 0 },
                reasoning: String,
                idealRole: String
            },
            biasAnalysis: {
                score: { type: Number, default: 100 },
                findings: [String],
                suggestions: [String]
            },
            interviewScript: [
                {
                    question: String,
                    answer: String
                }
            ],
            hiddenBriefing: {
                vibe: String,
                theOneThing: String,
                probe: String,
                redFlags: [String]
            }
        },
        assessments: {
            type: Map,
            of: {
                score: Number,
                dimensionBreakdown: [Object],
                skillBreakdown: [Object],
                completedAt: Date
            }
        },
        createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        organization: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
    },
    { timestamps: true }
);

export default mongoose.model<ICandidate>('Candidate', CandidateSchema);
