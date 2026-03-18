import mongoose, { Schema, Document } from 'mongoose';

export interface IJob extends Document {
    title: string;
    description: string;
    department: string;
    location: string;
    employmentType: 'full-time' | 'part-time' | 'contract' | 'internship';
    experienceLevel: 'entry' | 'mid' | 'senior';
    salaryRange?: {
        min: number;
        max: number;
        currency: string;
    };
    numberOfOpenings: number;
    status: 'draft' | 'active' | 'published' | 'paused' | 'closed' | 'PUBLISHED' | 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'CLOSED';
    postedBy: mongoose.Types.ObjectId;
    hiringTeam: mongoose.Types.ObjectId[];
    screeningQuestions: any[];
    requirements: string[];
    niceToHave: string[];
    responsibilities: string[];
    applicationDeadline?: Date;
    externalPostings: any[];
    embedding?: number[];
    organization: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const JobSchema: Schema = new Schema(
    {
        title: { type: String, required: true, trim: true },
        description: { type: String, required: true },
        department: { type: String, required: false, trim: true },
        location: { type: String, required: false, trim: true },
        employmentType: {
            type: String,
            enum: ['full-time', 'part-time', 'contract', 'internship'],
            default: 'full-time',
        },
        experienceLevel: {
            type: String,
            enum: ['entry', 'mid', 'senior'],
            default: 'mid',
        },
        salaryRange: {
            min: Number,
            max: Number,
            currency: { type: String, default: 'USD' },
        },
        numberOfOpenings: { type: Number, default: 1 },
        status: {
            type: String,
            enum: ['draft', 'active', 'published', 'paused', 'closed', 'PUBLISHED', 'DRAFT', 'ACTIVE', 'PAUSED', 'CLOSED'],
            default: 'draft',
        },
        postedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        hiringTeam: [{ type: Schema.Types.ObjectId, ref: 'User' }],
        screeningQuestions: Array,
        requirements: [String],
        niceToHave: [String],
        responsibilities: [String],
        applicationDeadline: Date,
        externalPostings: Array,
        embedding: { type: [Number], default: [] },
        organization: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
    },
    { timestamps: true }
);

export default mongoose.model<IJob>('Job', JobSchema);
