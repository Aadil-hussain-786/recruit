import mongoose from 'mongoose';
import Candidate from './src/models/Candidate';
import * as dotenv from 'dotenv';
dotenv.config();

async function addSkills() {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/recruit-ai');
    const result = await Candidate.updateMany(
        { firstName: 'Aadil', lastName: 'Hussain' },
        { $set: { skills: ['React', 'TypeScript', 'Node.js', 'Next.js', 'MongoDB', 'PostgreSQL', 'AWS', 'Docker'] } }
    );
    console.log(`Updated ${result.modifiedCount} candidates.`);
    await mongoose.disconnect();
}

addSkills();
