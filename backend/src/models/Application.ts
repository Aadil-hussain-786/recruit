import mongoose, { Schema, Document } from 'mongoose';

export interface IApplication extends Document {
    job: mongoose.Types.ObjectId;
    candidate: mongoose.Types.ObjectId;
    stage: 'applied' | 'screening' | 'interview' | 'offer' | 'hired' | 'rejected';
    status: 'active' | 'rejected' | 'withdrawn' | 'hired';
    source: string;
    appliedDate: Date;
    screeningAnswers: any[];
    rejectionReason?: string;
    timeline: {
        stage: string;
        status: string;
        changedBy: mongoose.Types.ObjectId;
        date: Date;
        note?: string;
    }[];
    assignedRecruiter?: mongoose.Types.ObjectId;
    organization: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const ApplicationSchema: Schema = new Schema(
    {
        job: { type: Schema.Types.ObjectId, ref: 'Job', required: true },
        candidate: { type: Schema.Types.ObjectId, ref: 'Candidate', required: true },
        stage: {
            type: String,
            enum: ['applied', 'screening', 'interview', 'offer', 'hired', 'rejected'],
            default: 'applied',
        },
        status: {
            type: String,
            enum: ['active', 'rejected', 'withdrawn', 'hired'],
            default: 'active',
        },
        source: String,
        appliedDate: { type: Date, default: Date.now },
        screeningAnswers: Array,
        rejectionReason: String,
        timeline: [
            {
                stage: String,
                status: String,
                changedBy: { type: Schema.Types.ObjectId, ref: 'User' },
                date: { type: Date, default: Date.now },
                note: String,
            },
        ],
        assignedRecruiter: { type: Schema.Types.ObjectId, ref: 'User' },
        organization: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
    },
    { timestamps: true }
);

// Compound index to prevent duplicate applications for same job
ApplicationSchema.index({ job: 1, candidate: 1 }, { unique: true });

export default mongoose.model<IApplication>('Application', ApplicationSchema);
