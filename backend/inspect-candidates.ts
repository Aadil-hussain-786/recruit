import mongoose from 'mongoose';
import Candidate from './src/models/Candidate';
import * as dotenv from 'dotenv';
dotenv.config();

async function inspectCandidates() {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/recruit-ai');
    const candidates = await Candidate.find({ organization: '697757f94438d6c908d31f96' });
    console.log('Candidates Count:', candidates.length);
    candidates.forEach(c => {
        console.log(`- ${c.firstName} ${c.lastName}: Skills: ${c.skills?.length || 0} (${c.skills?.join(', ')})`);
    });
    await mongoose.disconnect();
}

inspectCandidates();
