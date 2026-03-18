import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
    email: string;
    password?: string;
    firstName: string;
    lastName: string;
    role: 'admin' | 'recruiter' | 'hiring_manager' | 'interviewer';
    organization: mongoose.Types.ObjectId;
    isEmailVerified: boolean;
    emailVerificationToken?: string;
    passwordResetToken?: string;
    passwordResetExpires?: Date;
    refreshTokens: string[];
    lastLogin?: Date;
    createdAt: Date;
    updatedAt: Date;
    matchPassword(enteredPassword: string): Promise<boolean>;
}

const UserSchema: Schema = new Schema(
    {
        email: { type: String, required: true, unique: true, lowercase: true, trim: true },
        password: { type: String, required: true, select: false },
        firstName: { type: String, required: true, trim: true },
        lastName: { type: String, required: true, trim: true },
        role: {
            type: String,
            enum: ['admin', 'recruiter', 'hiring_manager', 'interviewer'],
            default: 'recruiter',
        },
        organization: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
        isEmailVerified: { type: Boolean, default: false },
        emailVerificationToken: String,
        passwordResetToken: String,
        passwordResetExpires: Date,
        refreshTokens: [String],
        lastLogin: Date,
    },
    { timestamps: true }
);

// Encrypt password using bcrypt
UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    try {
        const salt = await bcrypt.genSalt(10);
        // @ts-ignore
        this.password = await bcrypt.hash(this.password as string, salt);
        next();
    } catch (error: any) {
        next(error);
    }
});

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function (enteredPassword: string) {
    // @ts-ignore
    return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model<IUser>('User', UserSchema);
