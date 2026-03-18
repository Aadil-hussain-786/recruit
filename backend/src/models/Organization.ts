import mongoose, { Schema, Document } from 'mongoose';

export interface IOrganization extends Document {
    name: string;
    domain?: string;
    plan: 'free' | 'pro' | 'enterprise';
    users: mongoose.Types.ObjectId[];
    settings: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
}

const OrganizationSchema: Schema = new Schema(
    {
        name: { type: String, required: true, trim: true },
        domain: { type: String, trim: true },
        plan: {
            type: String,
            enum: ['free', 'pro', 'enterprise'],
            default: 'free',
        },
        users: [{ type: Schema.Types.ObjectId, ref: 'User' }],
        settings: { type: Object, default: {} },
    },
    { timestamps: true }
);

export default mongoose.model<IOrganization>('Organization', OrganizationSchema);
