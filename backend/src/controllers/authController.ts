import { Request, Response } from 'express';
import mongoose from 'mongoose';
import User from '../models/User';
import Organization from '../models/Organization';
import Job from '../models/Job';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// Generate JWT Token
const generateToken = (id: string): string => {
    try {
        const jwtSecret = process.env.JWT_SECRET;
        const jwtExpire = process.env.JWT_EXPIRE || '30d';

        if (!jwtSecret) {
            console.error('JWT_SECRET is missing!');
            // Provide a fallback for development to prevent registration failure
            if (process.env.NODE_ENV !== 'production') {
                console.warn('Using development fallback for JWT_SECRET');
                return jwt.sign({ id }, 'dev_secret_key_12345', {
                    expiresIn: jwtExpire as any,
                });
            }
            throw new Error('JWT_SECRET is not defined in environment variables');
        }

        console.log(`Generating token for ID: ${id}`);
        return jwt.sign({ id }, jwtSecret, {
            expiresIn: jwtExpire as any,
        });
    } catch (err) {
        console.error('Token Generation Error:', err);
        throw err;
    }
};


// @desc    Register a new user and organization
// @route   POST /api/auth/register
// @access  Public
export const register = async (req: Request, res: Response) => {
    try {
        console.log('Registration request received:', JSON.stringify(req.body, null, 2));
        const { firstName, lastName, email, password, organizationName } = req.body;

        // Validation
        if (!firstName || !lastName || !email || !password) {
            console.log('Validation failed: Missing fields');
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields (firstName, lastName, email, password)'
            });
        }

        // Check if user exists
        console.log(`Checking if user exists with email: ${email}`);
        const userExists = await User.findOne({ email });

        if (userExists) {
            console.log('User already exists:', email);
            return res.status(400).json({ success: false, message: 'User already exists' });
        }

        // Create organization first
        console.log('Creating organization...');
        const orgName = organizationName || `${firstName}'s Organization`;
        const organization = await Organization.create({
            name: orgName,
        });
        console.log('Organization created successfully:', organization._id);

        // Then create user linked to the organization
        console.log('Creating user...');
        const user = await User.create({
            firstName,
            lastName,
            email,
            password,
            organization: organization._id,
            role: 'admin',
        });
        console.log('User created successfully:', user._id);

        // Add user to organization's users array
        try {
            await Organization.findByIdAndUpdate(organization._id, {
                $push: { users: user._id }
            });
        } catch (orgUpdateError) {
            console.warn('Failed to link user to organization users array:', orgUpdateError);
        }

        // Seed a sample job for the new user
        try {
            await Job.create({
                title: 'Senior Robotics System Engineer',
                description: 'We are looking for a Senior Robotics System Engineer with expertise in ROS 2, C++, and autonomous navigation. You will be responsible for designing and implementing control algorithms for our next-generation mobile manipulation platform. Experience with motion planning and sensor fusion is highly desirable.',
                status: 'published',
                organization: organization._id,
                postedBy: user._id,
                location: 'Remote/Hybrid',
                department: 'Engineering'
            });
            console.log('Sample job seeded successfully');
        } catch (seedError) {
            console.warn('Failed to seed sample job:', seedError);
        }

        console.log('Generating token...');
        const token = generateToken(user._id.toString());
        console.log('Token generated successfully');

        res.status(201).json({
            success: true,
            token,
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
                organizationId: user.organization,
            },
        });
    } catch (error: any) {
        console.error('Registration Error Details:', error);
        
        // Handle Mongoose Validation Error
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map((val: any) => val.message);
            return res.status(400).json({
                success: false,
                message: messages.join(', ')
            });
        }

        // Handle Mongoose Duplicate Key Error
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'A user with this email already exists'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Server Error during registration',
            error: error.message,
            stack: process.env.NODE_ENV === 'production' ? null : error.stack
        });
    }
};


// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        console.log(`Login attempt for email: ${email}`);

        // Validate email & password
        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Please provide an email and password' });
        }

        // Check for user
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            console.log(`User not found: ${email}`);
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        console.log('User found, checking password...');
        // Check if password matches
        // Attempt using matchPassword method, fallback to direct bcrypt compare if needed
        let isMatch = false;
        try {
            isMatch = await (user as any).matchPassword(password);
        } catch (pwError) {
            console.error('matchPassword method failed, trying direct bcrypt compare:', pwError);
            if (user.password) {
                isMatch = await bcrypt.compare(password, user.password);
            }
        }

        if (!isMatch) {
            console.log('Password mismatch');
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        console.log('Password matches, generating token...');
        console.log(`User ID for token: ${user._id}`);
        const token = generateToken(user._id.toString());
        console.log('Token generated successfully');

        res.status(200).json({
            success: true,
            token,
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
                organizationId: user.organization,
            },
        });
    } catch (error: any) {
        console.error('Login Error Details:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error during login',
            error: error.message,
            stack: process.env.NODE_ENV === 'production' ? null : error.stack
        });
    }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user._id;
        const user = await User.findById(userId).populate('organization');

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.status(200).json({
            success: true,
            data: user,
        });
    } catch (error: any) {
        console.error('GetMe Error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server Error',
            error: error.message,
            stack: process.env.NODE_ENV === 'production' ? null : error.stack
        });
    }
};
