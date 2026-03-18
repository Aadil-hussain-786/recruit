import mongoose, { Schema, Document } from 'mongoose';

export interface IInterview extends Document {
    application: mongoose.Types.ObjectId;
    job: mongoose.Types.ObjectId;
    candidate: mongoose.Types.ObjectId;
    round: 'Phone Screen' | 'Technical' | 'HR' | 'Final' | 'Other';
    type: 'In-person' | 'Phone' | 'Video';
    scheduledAt: Date;
    duration: number; // minutes
    interviewers: mongoose.Types.ObjectId[];
    location?: string;
    meetingLink?: string;
    status: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
    agenda?: string;
    feedbackSubmitted: boolean;
    createdBy: mongoose.Types.ObjectId;
    organization: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const InterviewSchema: Schema = new Schema(
    {
        application: { type: Schema.Types.ObjectId, ref: 'Application', required: true },
        job: { type: Schema.Types.ObjectId, ref: 'Job', required: true },
        candidate: { type: Schema.Types.ObjectId, ref: 'Candidate', required: true },
        round: {
            type: String,
            enum: ['Phone Screen', 'Technical', 'HR', 'Final', 'Other'],
            default: 'Phone Screen',
        },
        type: {
            type: String,
            enum: ['In-person', 'Phone', 'Video'],
            default: 'Video',
        },
        scheduledAt: { type: Date, required: true },
        duration: { type: Number, default: 60 },
        interviewers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
        location: String,
        meetingLink: String,
        status: {
            type: String,
            enum: ['scheduled', 'completed', 'cancelled', 'no-show'],
            default: 'scheduled',
        },
        agenda: String,
        feedbackSubmitted: { type: Boolean, default: false },
        createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        organization: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
    },
    { timestamps: true }
);

export default mongoose.model<IInterview>('Interview', InterviewSchema);
